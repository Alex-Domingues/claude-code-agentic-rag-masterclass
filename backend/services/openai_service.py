from typing import AsyncGenerator

from openai import AsyncOpenAI

from auth import supabase
from config import settings

openai = AsyncOpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = "You are a helpful assistant. Answer clearly and concisely."
MAX_HISTORY_MESSAGES = 20


async def get_messages(thread_id: str) -> list[dict]:
    result = (
        supabase.table("messages")
        .select("role, content, created_at")
        .eq("thread_id", thread_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data if result.data else []


async def stream_chat(thread_id: str, message: str) -> AsyncGenerator[str, None]:
    history = await get_messages(thread_id)

    # Build conversation history for the Responses API (user/assistant turns only)
    input_messages = []
    for row in history[-MAX_HISTORY_MESSAGES:]:
        input_messages.append({"role": row["role"], "content": row["content"]})
    input_messages.append({"role": "user", "content": message})

    # Persist user message before streaming
    supabase.table("messages").insert(
        {"thread_id": thread_id, "role": "user", "content": message}
    ).execute()

    assistant_chunks: list[str] = []

    async with openai.responses.stream(
        model="gpt-4o",
        instructions=SYSTEM_PROMPT,
        input=input_messages,
        tools=[
            {
                "type": "file_search",
                "vector_store_ids": [settings.openai_vector_store_id],
            }
        ],
    ) as stream:
        async for event in stream:
            if event.type == "response.output_text.delta":
                assistant_chunks.append(event.delta)
                yield event.delta

    # Persist full assistant response after streaming
    full_response = "".join(assistant_chunks)
    if full_response:
        supabase.table("messages").insert(
            {"thread_id": thread_id, "role": "assistant", "content": full_response}
        ).execute()
