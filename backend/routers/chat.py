import json
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from auth import get_current_user
from services.openai_service import get_messages, stream_chat

router = APIRouter()


class ChatRequest(BaseModel):
    thread_id: str
    message: str


async def event_generator(thread_id: str, message: str, user_id: str):
    async for chunk in stream_chat(thread_id=thread_id, message=message):
        yield f"data: {json.dumps(chunk)}\n\n"
    yield "data: [DONE]\n\n"


@router.get("/messages/{thread_id}")
async def list_messages(thread_id: str, user: Any = Depends(get_current_user)):
    messages = await get_messages(thread_id)
    return [{"role": m["role"], "content": m["content"]} for m in messages]


@router.post("/stream")
async def stream_chat(
    body: ChatRequest, user: Any = Depends(get_current_user)
):
    return StreamingResponse(
        event_generator(body.thread_id, body.message, str(user.id)),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
