import aiosqlite
from typing import AsyncGenerator
from core.config import settings, get_llm


async def _load_employee_data(employee_id: str) -> dict:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row

        emp = await (await db.execute(
            "SELECT id, name, grade, department FROM employees WHERE id = ?",
            (employee_id,),
        )).fetchone()

        kpi_rows = await (await db.execute(
            "SELECT period, score FROM kpi_records WHERE employee_id = ? ORDER BY period DESC LIMIT 4",
            (employee_id,),
        )).fetchall()

        comp_rows = await (await db.execute(
            "SELECT skill_name, current_level, target_level, gap FROM competencies WHERE employee_id = ? ORDER BY gap DESC",
            (employee_id,),
        )).fetchall()

        lp_rows = await (await db.execute(
            """
            SELECT c.title, lp.status, lp.progress_pct
            FROM learning_progress lp
            JOIN courses c ON c.id = lp.course_id
            WHERE lp.employee_id = ?
            ORDER BY lp.progress_pct ASC
            """,
            (employee_id,),
        )).fetchall()

    return {
        "employee": dict(emp) if emp else {},
        "kpi": [dict(r) for r in kpi_rows],
        "competencies": [dict(r) for r in comp_rows],
        "learning": [dict(r) for r in lp_rows],
    }


def _kpi_trend(kpi: list[dict]) -> str:
    if len(kpi) < 2:
        return "данных недостаточно"
    scores = [r["score"] for r in kpi]
    delta = scores[0] - scores[-1]
    if delta > 0.03:
        return f"растёт (+{delta:.0%} за период)"
    if delta < -0.03:
        return f"снижается ({delta:.0%} за период)"
    return "стабильно"


async def run(manager_id: str, employee_id: str) -> AsyncGenerator[str, None]:
    data = await _load_employee_data(employee_id)
    emp = data["employee"]
    kpi = data["kpi"]
    competencies = data["competencies"]
    learning = data["learning"]

    kpi_text = "\n".join(
        [f"- {r['period']}: {r['score']:.0%}" for r in kpi]
    ) or "нет данных"
    trend = _kpi_trend(kpi)

    problem_comps = [c for c in competencies if c["gap"] >= 2]
    comp_text = "\n".join(
        [f"- {c['skill_name']}: {c['current_level']}/5 → цель {c['target_level']}/5 (gap {c['gap']})" for c in problem_comps]
    ) or "нет критических пробелов"

    stuck_courses = [l for l in learning if l["status"] == "in_progress" and l["progress_pct"] < 50]
    courses_text = "\n".join(
        [f"- «{l['title']}»: {l['progress_pct']}% (завис)" for l in stuck_courses]
    ) or "нет зависших курсов"

    prompt = f"""Ты — AI-ассистент менеджера в T&D-системе ИТ-кластера Газпром Нефти.
Сгенерируй структурированный бриф для встречи 1-on-1 с сотрудником.
Используй только данные ниже. Язык — деловой, живой, конкретный.
Структура обязательна: разделы с заголовками заглавными буквами.

Сотрудник: {emp.get('name', employee_id)}, {emp.get('grade', '').capitalize()}, {emp.get('department', '')}

KPI (последние периоды, тренд: {trend}):
{kpi_text}

Компетенции с пробелами (gap ≥ 2):
{comp_text}

Зависшие курсы (прогресс < 50%):
{courses_text}

Сгенерируй бриф с разделами:
ЧТО ВЫРОСЛО — 1-2 пункта про позитивную динамику
ЧТО БЕСПОКОИТ — конкретные пробелы и зависшие курсы
ВОПРОСЫ ДЛЯ РАЗГОВОРА — 3 живых вопроса, не шаблонных
ПРЕДЛАГАЕМЫЕ ЦЕЛИ — 2 конкретных цели с дедлайном +30 дней"""

    llm = get_llm(max_tokens=500)

    async def _stream() -> AsyncGenerator[str, None]:
        async for chunk in llm.astream(prompt):
            if chunk.content:
                yield chunk.content

    return _stream()
