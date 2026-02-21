import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = { is_admin: boolean; email: string | null };

export function AdminAuthGate({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function checkAdmin() {
    setChecking(true);
    setErr(null);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setChecking(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin, email")
      .eq("id", user.id)
      .single();

    if (error) {
      setErr(error.message);
      setChecking(false);
      return;
    }

    if ((profile as Profile).is_admin) {
      onSuccess();
    } else {
      setErr("Not authorized (not an admin).");
      await supabase.auth.signOut();
    }

    setChecking(false);
  }

  useEffect(() => {
    checkAdmin();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login() {
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    // onAuthStateChange will trigger checkAdmin()
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          {err && <div className="text-sm text-destructive">{err}</div>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={login} className="flex-1">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}