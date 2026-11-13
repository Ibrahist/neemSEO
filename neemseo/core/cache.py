"""
neemSEO Caching Layer.
Provides fast in-memory / persistent key-value caching with TTL expiration to prevent redundant API calls.
"""

import hashlib
import json
import time
from typing import Optional, Any, Dict


class SimpleCache:
    def __init__(self):
        # In-memory store: key -> (value, expiry_timestamp)
        self._store: Dict[str, tuple[Any, float]] = {}

    @staticmethod
    def generate_key(prefix: str, endpoint: str, params: Dict[str, Any]) -> str:
        serialized = json.dumps(params, sort_keys=True, default=str)
        hash_digest = hashlib.sha256(f"{prefix}:{endpoint}:{serialized}".encode("utf-8")).hexdigest()
        return f"{prefix}:{endpoint}:{hash_digest[:16]}"

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        value, expiry = self._store[key]
        if time.time() > expiry:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl_seconds: int = 86400 * 7) -> None:
        expiry = time.time() + ttl_seconds
        self._store[key] = (value, expiry)

    def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    def clear(self) -> None:
        self._store.clear()


# Global cache instance
cache = SimpleCache()

