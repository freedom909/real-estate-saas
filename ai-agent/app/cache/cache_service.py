import hashlib
import time

class CacheService:
    def __init__(self):
        self.store = {}
        self.ttl = 60 * 5  # 5分钟

    def _key(self, text: str):
        return hashlib.md5(text.encode()).hexdigest()

    def get(self, text: str):
        key = self._key(text)

        if key in self.store:
            value, expire = self.store[key]

            if time.time() < expire:
                return value

        return None

    def set(self, text: str, value):
        key = self._key(text)
        expire = time.time() + self.ttl
        self.store[key] = (value, expire)