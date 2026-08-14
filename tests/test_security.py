import unittest

from security import SessionSigner, SlidingWindowRateLimiter


class SessionSignerTests(unittest.TestCase):
    def setUp(self):
        self.signer = SessionSigner("a" * 32)

    def test_issued_token_verifies(self):
        session_id, token = self.signer.issue()
        self.assertEqual(self.signer.verify(token), session_id)

    def test_tampered_token_is_rejected(self):
        _, token = self.signer.issue()
        replacement = "0" if token[-1] != "0" else "1"
        self.assertIsNone(self.signer.verify(token[:-1] + replacement))

    def test_short_secret_is_rejected(self):
        with self.assertRaises(ValueError):
            SessionSigner("too-short")


class RateLimiterTests(unittest.TestCase):
    def test_blocks_after_limit_and_recovers_after_window(self):
        limiter = SlidingWindowRateLimiter(limit=2, window_seconds=60)
        self.assertTrue(limiter.allow("client", now=1))
        self.assertTrue(limiter.allow("client", now=2))
        self.assertFalse(limiter.allow("client", now=3))
        self.assertTrue(limiter.allow("client", now=62))

    def test_client_cache_is_bounded(self):
        limiter = SlidingWindowRateLimiter(limit=1, max_clients=2)
        for index in range(3):
            self.assertTrue(limiter.allow(f"client-{index}", now=1))
        self.assertLessEqual(len(limiter._events), 2)


if __name__ == "__main__":
    unittest.main()
