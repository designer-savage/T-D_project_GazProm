import aiosqlite
from pathlib import Path
from core.config import settings


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(settings.database_url)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    Path(settings.database_url).parent.mkdir(parents=True, exist_ok=True)
    schema = Path(__file__).parent.parent / "db" / "schema.sql"
    async with aiosqlite.connect(settings.database_url) as db:
        await db.executescript(schema.read_text())
        await db.commit()
