import { type FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/MessageBubble";
import type { Message, Thread } from "@/types";

const API_URL = import.meta.env.VITE_API_URL as string;

interface ChatWindowProps {
  thread: Thread;
  onTitleUpdate: (id: string, title: string) => void;
}

export function ChatWindow({ thread, onTitleUpdate }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstMessage = useRef(true);

  // Load history on thread change
  useEffect(() => {
    setMessages([]);
    isFirstMessage.current = true;

    async function loadHistory() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(
        `${API_URL}/api/chat/messages/${thread.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const msgs = await res.json() as { role: string; content: string }[];
      setMessages(
        msgs.map((m) => ({ id: crypto.randomUUID(), role: m.role as "user" | "assistant", content: m.content }))
      );
      isFirstMessage.current = msgs.length === 0;
    }

    loadHistory();
  }, [thread.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Auto-title on first message
    if (isFirstMessage.current) {
      isFirstMessage.current = false;
      const title = text.slice(0, 50);
      onTitleUpdate(thread.id, title);
    }

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ thread_id: thread.id, message: text }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") {
            setIsStreaming(false);
            return;
          }
          try {
            const text = JSON.parse(data) as string;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + text,
                };
              }
              return updated;
            });
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && last.content === "") {
          updated[updated.length - 1] = {
            ...last,
            content: "Sorry, something went wrong. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-medium text-sm truncate text-foreground">{thread.title}</h2>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Start the conversation by sending a message.
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1}
          />
        ))}
        <div ref={bottomRef} />
      </ScrollArea>

      <form onSubmit={sendMessage} className="border-t border-border p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isStreaming}
          className="flex-1"
        />
        <Button type="submit" disabled={isStreaming || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
