from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_current_user, supabase

router = APIRouter()


class ThreadTitleUpdate(BaseModel):
    title: str


@router.post("")
async def create_thread(user: Any = Depends(get_current_user)):
    result = (
        supabase.table("threads")
        .insert({"user_id": user.id, "title": "New conversation"})
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create thread",
        )

    return result.data[0]


@router.get("")
async def list_threads(user: Any = Depends(get_current_user)):
    result = (
        supabase.table("threads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.delete("/{thread_id}")
async def delete_thread(thread_id: str, user: Any = Depends(get_current_user)):
    result = (
        supabase.table("threads")
        .delete()
        .eq("id", thread_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    return {"ok": True}


@router.patch("/{thread_id}")
async def update_thread_title(
    thread_id: str,
    body: ThreadTitleUpdate,
    user: Any = Depends(get_current_user),
):
    result = (
        supabase.table("threads")
        .update({"title": body.title})
        .eq("id", thread_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    return result.data[0]
