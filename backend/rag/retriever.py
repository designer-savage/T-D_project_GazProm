import aiosqlite
from core.config import settings


def _fts_query(text: str) -> str:
    return '"' + text.replace('"', ' ') + '"'


async def retrieve(query: str, category: str | None = None, limit: int = 3) -> list[dict]:
    safe = _fts_query(query)
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        try:
            if category:
                cursor = await db.execute(
                    """
                    SELECT doc_id, title, content, category
                    FROM knowledge_fts
                    WHERE knowledge_fts MATCH ? AND category = ?
                    ORDER BY rank
                    LIMIT ?
                    """,
                    (safe, category, limit),
                )
            else:
                cursor = await db.execute(
                    """
                    SELECT doc_id, title, content, category
                    FROM knowledge_fts
                    WHERE knowledge_fts MATCH ?
                    ORDER BY rank
                    LIMIT ?
                    """,
                    (safe, limit),
                )
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]
        except Exception:
            return []


def format_context(docs: list[dict]) -> str:
    if not docs:
        return "Релевантных документов не найдено."
    parts = []
    for doc in docs:
        parts.append(f"### {doc['title']}\n{doc['content']}")
    return "\n\n".join(parts)
