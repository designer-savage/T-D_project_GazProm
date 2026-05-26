import aiosqlite
from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/team")
async def get_team_dashboard(manager_id: str = "mgr_001"):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row

        # Получаем всех членов команды с прогрессом одним запросом
        members_cursor = await db.execute(
            """
            SELECT
                e.id,
                e.name,
                e.grade,
                COUNT(lp.course_id) AS courses_total,
                SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS courses_completed,
                COALESCE(AVG(lp.progress_pct), 0) AS avg_progress_pct
            FROM employees e
            LEFT JOIN learning_progress lp ON lp.employee_id = e.id
            WHERE e.manager_id = ?
            GROUP BY e.id, e.name, e.grade
            """,
            (manager_id,),
        )
        rows = [dict(r) for r in await members_cursor.fetchall()]

        # at-risk: больше половины курсов с прогрессом < 50%
        at_risk_cursor = await db.execute(
            """
            SELECT lp.employee_id
            FROM learning_progress lp
            JOIN employees e ON e.id = lp.employee_id
            WHERE e.manager_id = ?
            GROUP BY lp.employee_id
            HAVING COUNT(*) > 0
               AND (SUM(CASE WHEN lp.progress_pct < 50 THEN 1 ELSE 0 END) * 1.0 / COUNT(*)) > 0.5
            """,
            (manager_id,),
        )
        at_risk_ids = {r["employee_id"] for r in await at_risk_cursor.fetchall()}

        members = [
            {
                "id": r["id"],
                "name": r["name"],
                "grade": r["grade"],
                "courses_completed": r["courses_completed"] or 0,
                "courses_total": r["courses_total"] or 0,
                "avg_progress_pct": round(r["avg_progress_pct"]),
                "risk_flag": r["id"] in at_risk_ids,
            }
            for r in rows
        ]

        avg_team_progress = sum(m["avg_progress_pct"] for m in members) / len(members) if members else 0

        return {
            "team_size": len(members),
            "avg_progress": round(avg_team_progress / 100, 2),
            "members": members,
        }
