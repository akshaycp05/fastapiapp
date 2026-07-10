import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base


def normalize_database_url(url: str) -> str:
    if not url:
        return url

    normalized = url.strip()

    if normalized.startswith("postgres://"):
        return normalized.replace("postgres://", "postgresql+asyncpg://", 1)

    if normalized.startswith("postgres+asyncpg://"):
        return normalized.replace("postgres+asyncpg://", "postgresql+asyncpg://", 1)

    if normalized.startswith("postgresql://"):
        return normalized.replace("postgresql://", "postgresql+asyncpg://", 1)

    return normalized


DATABASE_URL = normalize_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:password@localhost:5432/Student_db",
    )
)

print("DATABASE_URL =", DATABASE_URL)

if "supabase.com" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"ssl": "require", "statement_cache_size": 0},
    )
else:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"statement_cache_size": 0},
    )

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()