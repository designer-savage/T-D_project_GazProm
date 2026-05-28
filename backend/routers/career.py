import aiosqlite
from fastapi import APIRouter, HTTPException
from core.config import settings

router = APIRouter(prefix="/career", tags=["career"])

GRADE_ORDER = ["junior", "middle", "senior", "lead", "principal"]
GRADE_MONTHS = {"junior": 18, "middle": 12, "senior": 18, "lead": 24, "principal": 0}


@router.get("/{employee_id}")
async def get_career_track(employee_id: str):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row

        emp_cursor = await db.execute(
            "SELECT grade FROM employees WHERE id = ?", (employee_id,)
        )
        emp = await emp_cursor.fetchone()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")

        grade = emp["grade"]
        current_idx = GRADE_ORDER.index(grade) if grade in GRADE_ORDER else 1
        next_grade = GRADE_ORDER[current_idx + 1] if current_idx < len(GRADE_ORDER) - 1 else grade

        comp_cursor = await db.execute(
            "SELECT skill_name, current_level, target_level, gap FROM competencies WHERE employee_id = ?",
            (employee_id,),
        )
        competencies = [dict(r) for r in await comp_cursor.fetchall()]

        avg_gap = sum(c["gap"] for c in competencies) / len(competencies) if competencies else 0
        estimated_months = max(3, int(avg_gap * 4))

        return {
            "current_grade": grade,
            "target_grade": next_grade,
            "grade_path": GRADE_ORDER[current_idx:],
            "competencies": competencies,
            "estimated_months": estimated_months,
        }
