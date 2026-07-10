import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database import normalize_database_url


class DatabaseTests(unittest.TestCase):
    def test_normalizes_supabase_postgres_asyncpg_url(self):
        url = "postgres+asyncpg://user:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

        self.assertEqual(
            normalize_database_url(url),
            "postgresql+asyncpg://user:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require",
        )


if __name__ == "__main__":
    unittest.main()
