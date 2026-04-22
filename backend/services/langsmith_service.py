import os
from typing import AsyncGenerator

from config import settings
from langsmith import traceable

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project


@traceable(
    run_type="chain",
    name="chat",
    reduce_fn=lambda outputs: {"response": "".join(outputs)},
)
async def stream_chat_traced(
    thread_id: str, message: str, user_id: str
) -> AsyncGenerator[str, None]:
    from services.openai_service import stream_chat

    async for chunk in stream_chat(thread_id, message):
        yield chunk
