import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents import one_on_one_agent

router = APIRouter(prefix="/manager", tags=["manager"])


class OneOnOnePrepRequest(BaseModel):
    manager_id: str = "mgr_001"
    employee_id: str = "emp_001"


@router.post("/one-on-one-prep")
async def one_on_one_prep(request: OneOnOnePrepRequest):
    async def event_generator():
        stream = await one_on_one_agent.run(request.manager_id, request.employee_id)
        async for chunk in stream:
            yield f"event: token\ndata: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
        yield f"event: done\ndata: {{}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
