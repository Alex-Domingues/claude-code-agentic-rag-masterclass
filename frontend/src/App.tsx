import { AuthPage } from "@/components/AuthPage";
import { ChatLayout } from "@/components/ChatLayout";
import { useAuth } from "@/hooks/useAuth";

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return session ? <ChatLayout /> : <AuthPage />;
}

export default App;
