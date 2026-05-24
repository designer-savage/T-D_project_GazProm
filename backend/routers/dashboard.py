import aiosqlite
from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/team")
async def get_team_dashboard(manager_id: str = "mgr_001"):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row

        emp_cursor = await db.execute(
            "SELECT id, name, grade FROM employees WHERE manager_id = ?", (manager_id,)
        )
        members_raw = [dict(r) for r in await emp_cursor.fetchall()]

        members = []
        total_progress = 0.0

        for emp in members_raw:
            prog_cursor = await db.execute(
                """
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    AVG(progress_pct) as avg_pct
                FROM learning_progress WHERE employee_id = ?
                """,
                (emp["id"],),
            )
            prog = dict(await prog_cursor.fetchone())

            total = prog["total"] or 0
            completed = prog["completed"] or 0
            avg_pct = prog["avg_pct"] or 0

            risk_flag = total > 0 and (completed / total < 0.3) and avg_pct < 20

            members.append({
                "id": emp["id"],
                "name": emp["name"],
                "grade": emp["grade"],
                "courses_completed": completed,
                "courses_total": total,
                "avg_progress_pct": round(avg_pct),
                "risk_flag": risk_flag,
            })
            total_progress += avg_pct

        avg_team_progress = total_progress / len(members) if members else 0

        return {
            "team_size": len(members),
            "avg_progress": round(avg_team_progress / 100, 2),
            "members": members,
        }
