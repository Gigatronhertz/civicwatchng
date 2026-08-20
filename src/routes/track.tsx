import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, formatDate, statusLabel, statusTone } from "@/lib/civic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track a Report — CivicWatch NG" },
      {
        name: "description",
        content:
          "Enter your CivicWatch NG reference code to see the current status and public updates on your tip-off, without revealing your identity.",
      },
      { property: "og:title", content: "Track a Report — CivicWatch NG" },
      {
        property: "og:description",
        content: "Follow the progress of an anonymous civic tip-off using your reference code.",
      },
    ],
  }),
  component: TrackPage,
});

type TrackUpdate = { note: string; status: string | null; created_at: string };
type TrackResult = {
  reference_code: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  updates: TrackUpdate[];
};

function TrackPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const { data, error: rpcError } = await supabase.rpc("track_report", {
      _reference_code: code.trim(),
    });
    setLoading(false);
    if (rpcError) {
      setError("We couldn't complete the lookup. Please try again.");
      return;
    }
    const row = (data as unknown as TrackResult[])?.[0];
    if (!row) {
      setError("No report matches that reference code. Check for typos and try again.");
      return;
    }
    setResult(row);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
          <h1 className="font-display text-4xl font-semibold">Track a report</h1>
          <p className="mt-3 text-muted-foreground">
            Enter the reference code you received when you submitted your tip-off. No sign-in, no
            identity required.
          </p>

          <form onSubmit={onSearch} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="code">Reference code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CTS-XXXXXXXX"
                className="mt-1.5 font-mono"
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="size-4" /> {loading ? "Searching…" : "Track"}
            </Button>
          </form>

          {error && (
            <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {result && (
            <Card className="mt-8 border-border/70 shadow-elevated">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-sm text-muted-foreground">
                    {result.reference_code}
                  </p>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      statusTone(result.status),
                    )}
                  >
                    {statusLabel(result.status)}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold">{result.subject}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {categoryLabel(result.category)} · Submitted {formatDate(result.created_at)}
                </p>

                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Updates
                </h3>
                {result.updates.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No public updates yet. Check back later.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {result.updates.map((u, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
                      >
                        <p className="text-xs text-muted-foreground">
                          {formatDate(u.created_at)}
                          {u.status ? ` · ${statusLabel(u.status)}` : ""}
                        </p>
                        <p className="mt-1">{u.note}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
