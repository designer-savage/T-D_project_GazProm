import aiosqlite
from typing import AsyncGenerator
from langchain_groq import ChatGroq
from core.config import settings
from agents import learning_agent, career_agent, onboarding_agent
from agents import reviewer


class AgentState:
    pass


_CLASSIFY_PROMPT = """Определи намерение запроса. Выбери одно: career, learning, onboarding, mixed.

career — карьерный рост, грейд, повышение, развитие как специалиста
learning — обучение, курсы, навыки, что изучить
onboarding — процессы компании, политики, как что-то оформить
mixed — одновременно про карьеру и обучение, или тема не определена

Запрос: "{query}"
Ответь одним словом."""

_VALID_INTENTS = {"career", "learning", "onboarding", "mixed"}

AGENT_LABELS = {
    "career": "Агент карьеры анализирует ваш профиль...",
    "learning": "Агент обучения подбирает курсы...",
    "onboarding": "Агент онбординга ищет ответ в базе знаний...",
}


async def _fetch_employee(employee_id: str) -> dict:
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, name, role, grade, department, manager_id FROM employees WHERE id = ?",
            (employee_id,),
        )
        row = await cursor.fetchone()
        return dict(row) if row else {}


async def _classify_intent(query: str) -> str:
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, max_tokens=5)
    response = await llm.ainvoke(_CLASSIFY_PROMPT.format(query=query))
    intent = response.content.strip().lower().split()[0] if response.content.strip() else "mixed"
    return intent if intent in _VALID_INTENTS else "mixed"


async def stream(query: str, employee_id: str, history: list[dict] | None = None) -> AsyncGenerator[dict, None]:
    employee_context = await _fetch_employee(employee_id)
    intent = await _classify_intent(query)
    history = history or []

    agents_to_run: list[str] = ["career", "learning"] if intent == "mixed" else [intent]

    for agent_name in agents_to_run:
        yield {"event": "agent_switch", "data": {"agent": agent_name, "label": AGENT_LABELS[agent_name]}}

        if agent_name == "career":
            token_gen, rag_docs = await career_agent.run(query, employee_context, history)
        elif agent_name == "learning":
            token_gen, rag_docs = await learning_agent.run(query, employee_context, history)
        else:
            token_gen, rag_docs = await onboarding_agent.run(query, employee_context, history)

        buffer: list[str] = []
        async for token in token_gen:
            buffer.append(token)
            yield {"event": "token", "data": {"text": token}}

        full_response = "".join(buffer)
        is_ok, clarification = reviewer.review(full_response, rag_docs)
        if not is_ok:
            yield {"event": "clarification", "data": {"text": clarification}}

        if len(agents_to_run) > 1 and agent_name != agents_to_run[-1]:
            yield {"event": "separator", "data": {"text": "\n\n---\n\n"}}

    yield {"event": "done", "data": {"agents_used": agents_to_run}}
