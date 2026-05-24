import aiosqlite
from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("")
async def get_courses(grade: str | None = None, category: str | None = None, limit: int = 10):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row

        query = "SELECT id, title, description, duration_hours, category, grade_target FROM courses WHERE 1=1"
        params: list = []

        if grade:
            query += " AND grade_target = ?"
            params.append(grade)
        if category:
            query += " AND category = ?"
            params.append(category)

        query += f" LIMIT {limit}"

        cursor = await db.execute(query, params)
        courses = [dict(r) for r in await cursor.fetchall()]
        return {"courses": courses, "total": len(courses)}
