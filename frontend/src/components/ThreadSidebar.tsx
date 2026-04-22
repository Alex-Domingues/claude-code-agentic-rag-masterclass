import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Thread } from "@/types";

interface ThreadSidebarProps {
  threads: Thread[];
  loading: boolean;
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSignOut: () => void;
}

export function ThreadSidebar({
  threads,
  loading,
  activeThreadId,
  onSelect,
  onNew,
  onDelete,
  onSignOut,
}: ThreadSidebarProps) {
  return (
    <aside className="flex flex-col w-64 border-r border-border bg-muted/30 h-full">
      <div className="p-3 border-b border-border">
        <Button onClick={onNew} className="w-full gap-2" size="sm">
          <MessageSquarePlus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-md bg-muted animate-pulse"
                />
              ))}
            </>
          ) : threads.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={cn(
                  "group w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors flex items-start justify-between gap-1",
                  activeThreadId === thread.id && "bg-accent"
                )}
              >
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {thread.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(thread.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onDelete(thread.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all cursor-pointer"
                  aria-label="Delete thread"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onSignOut}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
