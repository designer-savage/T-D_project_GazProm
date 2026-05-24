import aiosqlite
from fastapi import APIRouter, HTTPException
from core.config import settings

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, name, role, grade, department, manager_id, hire_date FROM employees WHERE id = ?",
            (employee_id,),
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Employee not found")

        emp = dict(row)

        kpi_cursor = await db.execute(
            "SELECT AVG(score) as avg_score FROM kpi_records WHERE employee_id = ?",
            (employee_id,),
        )
        kpi_row = await kpi_cursor.fetchone()
        emp["kpi_score"] = round(kpi_row["avg_score"] or 0, 2)

        return emp
