import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL as string;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res;
}

export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  return res.json() as Promise<T>;
}
