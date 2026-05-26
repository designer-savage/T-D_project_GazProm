from typing import AsyncGenerator
from langchain_groq import ChatGroq
from rag.retriever import retrieve, format_context
from core.config import settings


def _format_history(history: list[dict]) -> str:
    if not history:
        return ""
    lines = []
    for m in history[-6:]:
        speaker = "Сотрудник" if m["role"] == "user" else "Ассистент"
        lines.append(f"{speaker}: {m['content']}")
    return "\n\nПредыдущий диалог:\n" + "\n".join(lines)


async def run(query: str, employee_context: dict, history: list[dict] | None = None) -> tuple[AsyncGenerator[str, None], list[dict]]:
    docs = await retrieve(query, limit=3)
    context = format_context(docs)

    history_text = _format_history(history or [])

    prompt = f"""Ты — корпоративный ассистент по онбордингу в ИТ-кластере Газпром Нефти.
Отвечай как живой человек, который знает ответ и говорит прямо. Не более 100 слов. Без приветствий и заключений.
Пиши связным текстом — не перечисляй пунктами, если можно сказать в двух предложениях.

Контекст из базы знаний компании:
{context}

Вопрос сотрудника: {query}{history_text}"""

    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, max_tokens=300)

    async def _stream() -> AsyncGenerator[str, None]:
        async for chunk in llm.astream(prompt):
            if chunk.content:
                yield chunk.content

    return _stream(), docs
