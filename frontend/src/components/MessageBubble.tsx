import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && !isUser && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  );
}
