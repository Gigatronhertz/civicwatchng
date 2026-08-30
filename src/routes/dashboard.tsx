import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, Paperclip, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryLabel,
  formatDate,
  priorityTone,
  PRIORITIES,
  statusLabel,
  statusTone,
  STATUSES,
  type StatusValue,
} from "@/lib/civic";
import { cn } from "@/lib/utils";
import {
  addUpdate,
  resetDemoData,
  setPriority,
  signOut,
  useDemoStore,
  type DemoReport,
  type PriorityValue,
} from "@/lib/demo-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Authority Dashboard — CivicWatch NG" },
      {
        name: "description",
        content:
          "Triage incoming civic tip-offs, review evidence, set priority and publish status updates for reporters tracking their reference codes.",
      },
      { property: "og:title", content: "Authority Dashboard — CivicWatch NG" },
      {
        property: "og:description",
        content: "Verified agency workspace for reviewing and resolving civic tip-offs.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { reports, session } = useDemoStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !session) void navigate({ to: "/auth" });
  }, [mounted, session, navigate]);

  const sorted = useMemo(
    () => [...reports].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [reports],
  );

  const filtered = useMemo(
    () =>
      sorted.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          r.subject.toLowerCase().includes(q) ||
          r.reference_code.toLowerCase().includes(q) ||
          (r.location_text ?? "").toLowerCase().includes(q)
        );
      }),
    [sorted, statusFilter, query],
  );

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  if (!mounted || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold">Triage dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as {session.name} · {session.role === "admin" ? "Administrator" : "Officer"}
              </p>
            </div>
            <div className="flex gap-2">
              {session.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetDemoData();
                    toast.success("Demo reports restored.");
                  }}
                >
                  Reset demo data
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  signOut();
                  void navigate({ to: "/" });
                }}
              >
                <LogOut className="size-4" /> Sign out
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total tip-offs", value: reports.length },
              {
                label: "Awaiting review",
                value: reports.filter((r) => r.status === "submitted").length,
              },
              {
                label: "Being acted on",
                value: reports.filter(
                  (r) => r.status === "under_review" || r.status === "in_progress",
                ).length,
              },
              {
                label: "Resolved",
                value: reports.filter((r) => r.status === "resolved").length,
              },
            ].map((s) => (
              <Card key={s.label} className="border-border/70 shadow-soft">
                <CardContent className="pt-6">
                  <p className="font-display text-3xl font-semibold">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subject, code or location"
              className="sm:max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className="space-y-3">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No reports match this filter.</p>
              )}
              {filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "w-full rounded-xl border bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/50",
                    selected?.id === r.id ? "border-primary/60" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.reference_code}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        statusTone(r.status),
                      )}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium">{r.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoryLabel(r.category)} · {formatDate(r.created_at)}
                  </p>
                </button>
              ))}
            </div>

            {selected ? <ReportDetail report={selected} author={session.name} /> : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ReportDetail({ report, author }: { report: DemoReport; author: string }) {
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState<StatusValue | "keep">("keep");

  return (
    <Card className="border-border/70 shadow-elevated">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-sm text-muted-foreground">{report.reference_code}</span>
          <div className="flex gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                statusTone(report.status),
              )}
            >
              {statusLabel(report.status)}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                priorityTone(report.priority),
              )}
            >
              {report.priority}
            </span>
          </div>
        </div>

        <h2 className="mt-3 text-xl font-semibold">{report.subject}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {categoryLabel(report.category)} · Submitted {formatDate(report.created_at)}
        </p>
        <p className="mt-4 whitespace-pre-line text-sm">{report.details}</p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Location</dt>
            <dd>
              {report.location_text ?? "Not provided"}
              {report.latitude && report.longitude
                ? ` (${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)})`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Incident time</dt>
            <dd>{formatDate(report.incident_at)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reporter</dt>
            <dd>
              {report.is_anonymous
                ? "Anonymous"
                : [report.contact_email, report.contact_phone].filter(Boolean).join(" · ") ||
                  "Contact not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Priority</dt>
            <dd className="mt-1">
              <Select
                value={report.priority}
                onValueChange={(v) => setPriority(report.id, v as PriorityValue)}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Evidence</p>
          {report.evidence_names.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">No files attached.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {report.evidence_names.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Paperclip className="size-3.5 text-muted-foreground" /> {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Post an update</p>
          <Textarea
            className="mt-3 bg-background"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="This note is visible to the reporter when they track their code."
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as StatusValue)}>
              <SelectTrigger className="h-9 w-56 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">Keep current status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    Set to {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => {
                if (note.trim().length < 5) {
                  toast.error("Write a short note before publishing.");
                  return;
                }
                addUpdate(report.id, {
                  note: note.trim(),
                  status: nextStatus === "keep" ? null : nextStatus,
                  is_public: true,
                  author,
                });
                setNote("");
                setNextStatus("keep");
                toast.success("Update published to the reporter.");
              }}
            >
              <ShieldCheck className="size-4" /> Publish update
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Timeline</p>
          {report.updates.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No updates yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {[...report.updates].reverse().map((u, i) => (
                <li key={i} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(u.created_at)} · {u.author}
                    {u.status ? ` · ${statusLabel(u.status)}` : ""}
                  </p>
                  <p className="mt-1">{u.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
