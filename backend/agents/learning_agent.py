import aiosqlite
from typing import AsyncGenerator
from rag.retriever import retrieve, format_context
from core.config import settings, get_llm


async def _get_employee_competencies(employee_id: str) -> list[dict]:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT skill_name, current_level, target_level, gap FROM competencies WHERE employee_id = ? AND gap > 0 ORDER BY gap DESC",
            (employee_id,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def _get_recommended_courses(grade: str) -> list[dict]:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, title, description, duration_hours, category FROM courses WHERE grade_target = ? OR grade_target IS NULL LIMIT 5",
            (grade,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


def _format_history(history: list[dict]) -> str:
    if not history:
        return ""
    lines = []
    for m in history[-6:]:
        speaker = "Сотрудник" if m["role"] == "user" else "Ассистент"
        lines.append(f"{speaker}: {m['content']}")
    return "\n\nПредыдущий диалог:\n" + "\n".join(lines)


async def run(query: str, employee_context: dict, history: list[dict] | None = None) -> tuple[AsyncGenerator[str, None], list[dict]]:
    employee_id = employee_context.get("id", "")
    grade = employee_context.get("grade", "middle")

    gaps = await _get_employee_competencies(employee_id)
    courses = await _get_recommended_courses(grade)
    docs = await retrieve(query, category="career", limit=2)
    kb_context = format_context(docs)

    gaps_text = "\n".join(
        [f"- {g['skill_name']}: текущий уровень {g['current_level']}/5, нужно {g['target_level']}/5 (gap: {g['gap']})" for g in gaps]
    ) or "Данные о компетенциях не найдены."

    courses_text = "\n".join(
        [f"- «{c['title']}» ({c['duration_hours']} ч, {c['category']})" for c in courses]
    ) or "Курсы не найдены."

    history_text = _format_history(history or [])

    prompt = f"""Ты — агент обучения в T&D-системе ИТ-кластера Газпром Нефти.
Говори как человек, который смотрит на профиль и прямо говорит что важно — без лишней воды.
Упоминай конкретные курсы и цифры из данных ниже. Не более 120 слов. Без приветствий, заголовков и заключений.
Пиши связным текстом — никаких нумерованных списков, пунктов "во-первых / во-вторых" и шаблонов.
Если нужно перечислить курсы — вставь их в текст естественно, через запятую или союзы.

Профиль сотрудника:
- Имя: {employee_context.get('name', 'Сотрудник')}
- Грейд: {grade}
- Отдел: {employee_context.get('department', 'ИТ')}

Разрывы в компетенциях (gaps):
{gaps_text}

Доступные курсы для грейда {grade}:
{courses_text}

Дополнительный контекст из базы знаний:
{kb_context}

Запрос сотрудника: {query}{history_text}"""

    llm = get_llm(max_tokens=350)

    async def _stream() -> AsyncGenerator[str, None]:
        async for chunk in llm.astream(prompt):
            if chunk.content:
                yield chunk.content

    return _stream(), docs
