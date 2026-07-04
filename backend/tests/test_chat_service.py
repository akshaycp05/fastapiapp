import unittest

from services.langchain_service import ask_ai


class ChatServiceTests(unittest.TestCase):
    def test_chat_falls_back_when_ai_is_unavailable(self):
        response = ask_ai("Hello")

        self.assertIsInstance(response, str)
        self.assertTrue(len(response) > 0)


if __name__ == "__main__":
    unittest.main()
