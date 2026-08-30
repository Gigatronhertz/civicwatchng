import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS, signIn, useDemoStore } from "@/lib/demo-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authority Login — CivicWatch NG" },
      {
        name: "description",
        content:
          "Secure sign-in for verified agency personnel to triage civic tip-offs, review evidence and publish status updates.",
      },
      { property: "og:title", content: "Authority Login — CivicWatch NG" },
      {
        property: "og:description",
        content: "Sign in to the CivicWatch NG authority dashboard.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useDemoStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/dashboard" });
  }, [session, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = signIn(email, password);
    setLoading(false);
    if (!user) {
      toast.error("Those credentials are not recognised.");
      return;
    }
    toast.success(`Welcome back, ${user.name}.`);
    void navigate({ to: "/dashboard" });
  };

  const useDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-4 py-16 sm:py-20">
          <div className="text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold">Authority access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              For verified agency personnel only. Reporters never need an account.
            </p>
          </div>

          <Card className="mt-8 border-border/70 shadow-elevated">
            <CardContent className="pt-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Work email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pass">Password</Label>
                  <Input
                    id="si-pass"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />} Sign in
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo accounts
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {DEMO_ACCOUNTS.map((a) => (
                    <li key={a.email} className="flex items-center justify-between gap-3">
                      <span>
                        <span className="font-medium">{a.role === "admin" ? "Admin" : "Officer"}</span>
                        <br />
                        <span className="font-mono text-xs text-muted-foreground">
                          {a.email} / {a.password}
                        </span>
                      </span>
                      <Button type="button" variant="outline" size="sm" onClick={() => useDemo(a)}>
                        Use
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
