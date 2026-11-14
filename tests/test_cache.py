"""
Tests for neemSEO Caching Layer.
"""

import time
from neemseo.core.cache import cache, cached_api_call


def test_cache_set_and_get():
    cache.set("test_key_1", {"msg": "hello_neemseo"}, ttl=60)
    val = cache.get("test_key_1")
    assert val is not None
    assert val["msg"] == "hello_neemseo"

    # Delete
    cache.delete("test_key_1")
    assert cache.get("test_key_1") is None


def test_cache_ttl_expiry():
    cache.set("short_lived", "value", ttl=1)
    assert cache.get("short_lived") == "value"
    time.sleep(1.1)
    assert cache.get("short_lived") is None


def test_cached_api_call_decorator():
    call_count = 0

    @cached_api_call(prefix="test_fn", ttl=60)
    def expensive_lookup(param: str):
        nonlocal call_count
        call_count += 1
        return f"result_for_{param}"

    r1 = expensive_lookup("alpha")
    assert r1 == "result_for_alpha"
    assert call_count == 1

    # Second call should be served from cache
    r2 = expensive_lookup("alpha")
    assert r2 == "result_for_alpha"
    assert call_count == 1  # Not incremented

    # Different parameter executes function
    r3 = expensive_lookup("beta")
    assert r3 == "result_for_beta"
    assert call_count == 2
