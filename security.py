"""Small security primitives used by the API.

This module intentionally has no framework dependencies so its behavior can be
tested without loading the embedding model or connecting to MongoDB.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import threading
import time
from collections import defaultdict, deque


class SessionSigner:
    """Create and validate opaque, signed browser session tokens."""

    def __init__(self, secret: str):
        if len(secret.encode("utf-8")) < 32:
            raise ValueError("SESSION_SECRET must contain at least 32 bytes")
        self._secret = secret.encode("utf-8")

    def issue(self) -> tuple[str, str]:
        session_id = secrets.token_hex(32)
        return session_id, self._token_for(session_id)

    def verify(self, token: str | None) -> str | None:
        if not token or token.count(".") != 1:
            return None
        session_id, supplied_signature = token.split(".", 1)
        if len(session_id) != 64 or any(c not in "0123456789abcdef" for c in session_id):
            return None
        expected_signature = self._signature(session_id)
        if not hmac.compare_digest(supplied_signature, expected_signature):
            return None
        return session_id

    def _token_for(self, session_id: str) -> str:
        return f"{session_id}.{self._signature(session_id)}"

    def _signature(self, session_id: str) -> str:
        return hmac.new(self._secret, session_id.encode("ascii"), hashlib.sha256).hexdigest()


class SlidingWindowRateLimiter:
    """A bounded, per-process sliding-window limiter for public endpoints."""

    def __init__(self, limit: int, window_seconds: int = 60, max_clients: int = 10_000):
        if limit < 1 or window_seconds < 1 or max_clients < 1:
            raise ValueError("rate-limit values must be positive")
        self.limit = limit
        self.window_seconds = window_seconds
        self.max_clients = max_clients
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, client_key: str, now: float | None = None) -> bool:
        current = time.monotonic() if now is None else now
        cutoff = current - self.window_seconds
        with self._lock:
            events = self._events[client_key]
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= self.limit:
                return False
            events.append(current)
            if len(self._events) > self.max_clients:
                self._prune(cutoff)
            return True

    def _prune(self, cutoff: float) -> None:
        stale = [key for key, events in self._events.items() if not events or events[-1] <= cutoff]
        for key in stale:
            self._events.pop(key, None)
        overflow = len(self._events) - self.max_clients
        for key in list(self._events)[:max(0, overflow)]:
            self._events.pop(key, None)
