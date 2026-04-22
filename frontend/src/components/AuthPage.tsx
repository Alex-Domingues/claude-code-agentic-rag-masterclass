import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

export function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-4 rounded-lg border border-border bg-card shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">RAG Masterclass</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to continue</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    </div>
  );
}
