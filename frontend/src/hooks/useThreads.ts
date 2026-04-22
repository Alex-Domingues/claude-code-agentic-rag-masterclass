import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Thread } from "@/types";

const API_URL = import.meta.env.VITE_API_URL as string;

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.session?.access_token}`,
  };
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/threads`, {
      headers: await authHeaders(),
    });
    const data: Thread[] = await res.json();
    setThreads(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const createThread = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/threads`, {
      method: "POST",
      headers: await authHeaders(),
    });
    const thread: Thread = await res.json();
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    return thread;
  }, []);

  const deleteThread = useCallback(async (id: string) => {
    await fetch(`${API_URL}/api/threads/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setActiveThreadId((prev) => (prev === id ? null : prev));
  }, []);

  const updateThreadTitle = useCallback(async (id: string, title: string) => {
    await fetch(`${API_URL}/api/threads/${id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify({ title }),
    });
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  return {
    threads,
    loading,
    activeThread,
    setActiveThreadId,
    createThread,
    deleteThread,
    updateThreadTitle,
  };
}
