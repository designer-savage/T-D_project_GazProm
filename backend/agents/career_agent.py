import aiosqlite
from langchain_groq import ChatGroq
from rag.retriever import retrieve, format_context
from core.config import settings

GRADE_ORDER = ["junior", "middle", "senior", "lead"]


async def _get_kpi(employee_id: str) -> list[dict]:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT period, score, category FROM kpi_records WHERE employee_id = ? ORDER BY period DESC LIMIT 4",
            (employee_id,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def _get_competencies(employee_id: str) -> list[dict]:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT skill_name, current_level, target_level, gap FROM competencies WHERE employee_id = ?",
            (employee_id,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def run(query: str, employee_context: dict) -> str:
    employee_id = employee_context.get("id", "")
    grade = employee_context.get("grade", "middle")

    kpi_records = await _get_kpi(employee_id)
    competencies = await _get_competencies(employee_id)
    docs = await retrieve(query, category="career", limit=3)
    kb_context = format_context(docs)

    current_idx = GRADE_ORDER.index(grade) if grade in GRADE_ORDER else 1
    next_grade = GRADE_ORDER[current_idx + 1] if current_idx < len(GRADE_ORDER) - 1 else grade

    kpi_text = "\n".join(
        [f"- {k['period']}: {k['score']:.0%} ({k['category']})" for k in kpi_records]
    ) or "Данные KPI не найдены."

    comp_text = "\n".join(
        [f"- {c['skill_name']}: {c['current_level']}/5 → цель {c['target_level']}/5" for c in competencies]
    ) or "Данные о компетенциях не найдены."

    prompt = f"""Ты — агент карьерного развития в T&D-системе ИТ-кластера Газпром Нефти.
Говори как живой человек, который хорошо знает профиль сотрудника — не как корпоративный отчёт.
Используй конкретные цифры из данных ниже. Не более 120 слов. Без приветствий, заголовков и заключений.
Пиши связным текстом — никаких нумерованных списков, пунктов и шаблонных структур вроде "шаг 1, шаг 2, шаг 3".

Профиль сотрудника:
- Имя: {employee_context.get('name', 'Сотрудник')}
- Текущий грейд: {grade}
- Следующий грейд: {next_grade}
- Отдел: {employee_context.get('department', 'ИТ')}

KPI за последние периоды:
{kpi_text}

Компетенции:
{comp_text}

Контекст из базы знаний:
{kb_context}

Запрос сотрудника: {query}"""

    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, max_tokens=350)
    response = await llm.ainvoke(prompt)
    return response.content
