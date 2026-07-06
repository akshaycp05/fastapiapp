import importlib
import sys
import unittest
from pathlib import Path


class EntrypointTests(unittest.TestCase):
    def test_backend_entrypoint_exports_app(self):
        backend_dir = Path(__file__).resolve().parents[1]
        if str(backend_dir) not in sys.path:
            sys.path.insert(0, str(backend_dir))

        module = importlib.import_module("main")

        self.assertTrue(hasattr(module, "app"))


if __name__ == "__main__":
    unittest.main()
