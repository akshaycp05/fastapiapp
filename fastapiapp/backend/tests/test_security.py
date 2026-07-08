import unittest

from utils.security import hash_password, verify_password


class SecurityTests(unittest.TestCase):
    def test_password_hashing_round_trip(self):
        password = "Secure123!"
        hashed = hash_password(password)

        self.assertNotEqual(hashed, password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("wrong-password", hashed))


if __name__ == "__main__":
    unittest.main()
