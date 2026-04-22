import { supabase } from "@/lib/supabase";
import { useThreads } from "@/hooks/useThreads";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { ChatWindow } from "@/components/ChatWindow";

export function ChatLayout() {
  const {
    threads,
    loading,
    activeThread,
    setActiveThreadId,
    createThread,
    deleteThread,
    updateThreadTitle,
  } = useThreads();

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex h-screen">
      <ThreadSidebar
        threads={threads}
        loading={loading}
        activeThreadId={activeThread?.id ?? null}
        onSelect={setActiveThreadId}
        onNew={createThread}
        onDelete={deleteThread}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 overflow-hidden">
        {activeThread ? (
          <ChatWindow thread={activeThread} onTitleUpdate={updateThreadTitle} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>Select or create a conversation to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
