import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents import orchestrator

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    employee_id: str = "emp_001"
    session_id: str = ""


async def event_generator(query: str, employee_id: str):
    async for event in orchestrator.stream(query, employee_id):
        yield f"event: {event['event']}\ndata: {json.dumps(event['data'], ensure_ascii=False)}\n\n"


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        event_generator(request.query, request.employee_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
