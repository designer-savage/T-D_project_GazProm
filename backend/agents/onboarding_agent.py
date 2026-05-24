from langchain_groq import ChatGroq
from rag.retriever import retrieve, format_context
from core.config import settings


async def run(query: str, employee_context: dict) -> str:
    docs = await retrieve(query, limit=3)
    context = format_context(docs)

    prompt = f"""Ты — корпоративный ассистент по онбордингу в ИТ-кластере Газпром Нефти.
Отвечай на русском языке, кратко и по делу. Не более 100 слов. Без вступлений и заключений — только суть.

Контекст из базы знаний компании:
{context}

Вопрос сотрудника: {query}

Дай чёткий, практичный ответ на основе контекста выше."""

    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, max_tokens=300)
    response = await llm.ainvoke(prompt)
    return response.content
