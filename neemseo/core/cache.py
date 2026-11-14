"""
neemSEO Unified Caching Layer.
Supports Redis for production clustering and transparent memory/dict fallback for standalone instances.
Caches expensive API lookups (PageSpeed, DataForSEO, Autocomplete) to eliminate duplicate API costs.
"""

import json
import time
import functools
import hashlib
from typing import Optional, Any, Callable
from neemseo.core.config import settings


class CacheManager:
    """Manages key-value caching with Redis primary and local memory fallback."""

    def __init__(self):
        self._redis_client = None
        self._memory_cache: dict[str, tuple[Any, float]] = {}
        self._redis_tested = False

    def _get_redis(self):
        if not self._redis_tested:
            self._redis_tested = True
            try:
                import redis
                client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=0.3,
                    socket_timeout=0.3,
                )
                client.ping()
                self._redis_client = client
            except Exception:
                self._redis_client = None
        return self._redis_client

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a cached object by key."""
        r = self._get_redis()
        if r:
            try:
                val = r.get(f"neemseo:{key}")
                if val:
                    return json.loads(val)
            except Exception:
                pass

        # Memory fallback
        if key in self._memory_cache:
            val, expiry = self._memory_cache[key]
            if expiry > time.time():
                return val
            else:
                del self._memory_cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store an object in cache with a TTL (seconds)."""
        expire_seconds = ttl if ttl is not None else settings.CACHE_DEFAULT_TTL
        r = self._get_redis()
        if r:
            try:
                r.setex(f"neemseo:{key}", expire_seconds, json.dumps(value, default=str))
                return
            except Exception:
                pass

        # Memory fallback
        self._memory_cache[key] = (value, time.time() + expire_seconds)

    def delete(self, key: str) -> None:
        """Remove a key from cache."""
        r = self._get_redis()
        if r:
            try:
                r.delete(f"neemseo:{key}")
            except Exception:
                pass
        self._memory_cache.pop(key, None)

    def clear_expired(self) -> None:
        """Prune expired keys from memory cache."""
        now = time.time()
        expired = [k for k, (_, exp) in self._memory_cache.items() if exp <= now]
        for k in expired:
            del self._memory_cache[k]


cache = CacheManager()


def cached_api_call(prefix: str, ttl: int = 86400):
    """
    Decorator to cache deterministic function results (e.g. API lookups).
    Generates cache key from prefix and hashed arguments.
    """
    def decorator(fn: Callable):
        @functools.wraps(fn)
        async def async_wrapper(*args, **kwargs):
            raw_args = f"{args}:{sorted(kwargs.items())}"
            arg_hash = hashlib.md5(raw_args.encode("utf-8")).hexdigest()
            cache_key = f"{prefix}:{arg_hash}"

            hit = cache.get(cache_key)
            if hit is not None:
                return hit

            res = await fn(*args, **kwargs)
            if res is not None:
                cache.set(cache_key, res, ttl=ttl)
            return res

        @functools.wraps(fn)
        def sync_wrapper(*args, **kwargs):
            raw_args = f"{args}:{sorted(kwargs.items())}"
            arg_hash = hashlib.md5(raw_args.encode("utf-8")).hexdigest()
            cache_key = f"{prefix}:{arg_hash}"

            hit = cache.get(cache_key)
            if hit is not None:
                return hit

            res = fn(*args, **kwargs)
            if res is not None:
                cache.set(cache_key, res, ttl=ttl)
            return res

        import inspect
        if inspect.iscoroutinefunction(fn):
            return async_wrapper
        return sync_wrapper

    return decorator
