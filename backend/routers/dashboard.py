import aiosqlite
from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/team")
async def get_team_dashboard(manager_id: str = "mgr_001"):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row

        members_cursor = await db.execute(
            """
            SELECT
                e.id,
                e.name,
                e.grade,
                e.department,
                e.hire_date,
                COUNT(lp.course_id) AS courses_total,
                SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS courses_completed,
                SUM(CASE WHEN lp.status = 'in_progress' THEN 1 ELSE 0 END) AS courses_in_progress,
                COALESCE(AVG(lp.progress_pct), 0) AS avg_progress_pct,
                (
                    SELECT k.score FROM kpi_records k
                    WHERE k.employee_id = e.id
                    ORDER BY k.id DESC LIMIT 1
                ) AS kpi_score
            FROM employees e
            LEFT JOIN learning_progress lp ON lp.employee_id = e.id
            WHERE e.manager_id = ?
            GROUP BY e.id, e.name, e.grade, e.department, e.hire_date
            """,
            (manager_id,),
        )
        rows = [dict(r) for r in await members_cursor.fetchall()]

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

        skill_gaps_cursor = await db.execute(
            """
            SELECT c.skill_name, SUM(c.gap) AS total_gap, COUNT(*) AS affected
            FROM competencies c
            JOIN employees e ON e.id = c.employee_id
            WHERE e.manager_id = ? AND c.gap > 0
            GROUP BY c.skill_name
            ORDER BY total_gap DESC
            LIMIT 5
            """,
            (manager_id,),
        )
        skill_gaps = [dict(r) for r in await skill_gaps_cursor.fetchall()]

        courses_stats_cursor = await db.execute(
            """
            SELECT
                SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS total_completed,
                SUM(CASE WHEN lp.status = 'in_progress' THEN 1 ELSE 0 END) AS total_in_progress,
                SUM(CASE WHEN lp.status = 'not_started' THEN 1 ELSE 0 END) AS total_not_started
            FROM learning_progress lp
            JOIN employees e ON e.id = lp.employee_id
            WHERE e.manager_id = ?
            """,
            (manager_id,),
        )
        cs_row = dict(await courses_stats_cursor.fetchone())

        members = [
            {
                "id": r["id"],
                "name": r["name"],
                "grade": r["grade"],
                "department": r["department"],
                "courses_completed": r["courses_completed"] or 0,
                "courses_in_progress": r["courses_in_progress"] or 0,
                "courses_total": r["courses_total"] or 0,
                "avg_progress_pct": round(r["avg_progress_pct"]),
                "kpi_score": round(r["kpi_score"], 2) if r["kpi_score"] is not None else None,
                "risk_flag": r["id"] in at_risk_ids,
            }
            for r in rows
        ]

        kpi_values = [m["kpi_score"] for m in members if m["kpi_score"] is not None]
        avg_kpi = round(sum(kpi_values) / len(kpi_values), 2) if kpi_values else 0
        avg_progress = sum(m["avg_progress_pct"] for m in members) / len(members) if members else 0

        return {
            "team_size": len(members),
            "avg_progress": round(avg_progress / 100, 2),
            "avg_kpi": avg_kpi,
            "members": members,
            "skill_gaps": skill_gaps,
            "courses_stats": {
                "completed": cs_row["total_completed"] or 0,
                "in_progress": cs_row["total_in_progress"] or 0,
                "not_started": cs_row["total_not_started"] or 0,
            },
        }
