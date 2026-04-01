from typing import List, Dict, Any

class MemoryService:
    def __init__(self):
        self._store: Dict[str, List[Dict[str, Any]]] = {}

    def get_history(self, user_id: str) -> List[Dict[str, Any]]:
        return self._store.get(user_id, [])

    def add_message(self, user_id: str, message: Dict[str, Any]):
        if user_id not in self._store:
            self._store[user_id] = []
        self._store[user_id].append(message)