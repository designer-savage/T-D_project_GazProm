import aiosqlite
from typing import TypedDict, AsyncGenerator
from langchain_community.llms import Ollama
from core.config import settings
from agents import learning_agent, career_agent, onboarding_agent


class AgentState(TypedDict):
    query: str
    employee_id: str
    employee_context: dict
    intent: str
    learning_result: str
    career_result: str
    onboarding_result: str
    active_agent: str


async def _fetch_employee(employee_id: str) -> dict:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, name, role, grade, department, manager_id FROM employees WHERE id = ?",
            (employee_id,),
        )
        row = await cursor.fetchone()
        return dict(row) if row else {}


def _classify_intent(query: str) -> str:
    q = query.lower()
    is_career = any(w in q for w in ["карьер", "грейд", "повышен", "тимлид", "lead", "рост", "перейти"])
    is_learning = any(w in q for w in ["курс", "учеб", "обучен", "изучить", "прокач", "навык", "скилл"])
    is_onboarding = any(w in q for w in ["онбординг", "новичок", "доступ", "оформить", "командировк", "отпуск", "политик", "как работает"])

    if is_career and is_learning:
        return "mixed"
    if is_career:
        return "career"
    if is_learning:
        return "learning"
    if is_onboarding:
        return "onboarding"
    return "mixed"


AGENT_LABELS = {
    "career": "Агент карьеры анализирует ваш профиль...",
    "learning": "Агент обучения подбирает курсы...",
    "onboarding": "Агент онбординга ищет ответ в базе знаний...",
}


async def stream(query: str, employee_id: str) -> AsyncGenerator[dict, None]:
    employee_context = await _fetch_employee(employee_id)
    intent = _classify_intent(query)

    agents_to_run: list[str] = []
    if intent == "mixed":
        agents_to_run = ["career", "learning"]
    else:
        agents_to_run = [intent]

    results: dict[str, str] = {}

    for agent_name in agents_to_run:
        yield {"event": "agent_switch", "data": {"agent": agent_name, "label": AGENT_LABELS[agent_name]}}

        if agent_name == "career":
            result = await career_agent.run(query, employee_context)
        elif agent_name == "learning":
            result = await learning_agent.run(query, employee_context)
        else:
            result = await onboarding_agent.run(query, employee_context)

        results[agent_name] = result

        for chunk in _split_chunks(result):
            yield {"event": "token", "data": {"text": chunk}}

        if len(agents_to_run) > 1 and agent_name != agents_to_run[-1]:
            yield {"event": "separator", "data": {"text": "\n\n---\n\n"}}

    yield {"event": "done", "data": {"agents_used": agents_to_run}}


def _split_chunks(text: str, size: int = 20) -> list[str]:
    words = text.split(" ")
    chunks = []
    current = []
    for word in words:
        current.append(word)
        if len(current) >= size:
            chunks.append(" ".join(current) + " ")
            current = []
    if current:
        chunks.append(" ".join(current))
    return chunks
