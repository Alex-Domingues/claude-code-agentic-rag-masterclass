export interface Thread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
