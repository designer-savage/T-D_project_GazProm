import json
import aiosqlite
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents import orchestrator
from core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    query: str
    employee_id: str = "emp_001"
    history: list[HistoryMessage] = []


async def _save_messages(employee_id: str, user_msg: str, assistant_msg: str):
    async with aiosqlite.connect(settings.database_url) as db:
        await db.execute(
            "INSERT INTO chat_messages (employee_id, role, content) VALUES (?, ?, ?)",
            (employee_id, "user", user_msg),
        )
        await db.execute(
            "INSERT INTO chat_messages (employee_id, role, content) VALUES (?, ?, ?)",
            (employee_id, "assistant", assistant_msg),
        )
        await db.commit()


async def event_generator(query: str, employee_id: str, history: list[dict]):
    response_parts: list[str] = []
    async for event in orchestrator.stream(query, employee_id, history):
        if event["event"] == "token":
            response_parts.append(event["data"]["text"])
        yield f"event: {event['event']}\ndata: {json.dumps(event['data'], ensure_ascii=False)}\n\n"
    await _save_messages(employee_id, query, "".join(response_parts))


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in request.history]
    return StreamingResponse(
        event_generator(request.query, request.employee_id, history),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/history")
async def chat_history(employee_id: str = "emp_001", limit: int = 10):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT role, content FROM chat_messages WHERE employee_id = ? ORDER BY id DESC LIMIT ?",
            (employee_id, limit),
        )
        rows = await cursor.fetchall()
        messages = [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]
        return {"messages": messages}
