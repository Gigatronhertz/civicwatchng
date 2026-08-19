import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  EyeOff,
  MapPin,
  Paperclip,
  Search,
  Gauge,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-civic.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/civic";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicWatch NG — Anonymous Crime & Corruption Tip-off Platform" },
      {
        name: "description",
        content:
          "Report crime, corruption and public-safety hazards in Nigeria anonymously, attach evidence, and track your report with a private reference code.",
      },
      { property: "og:title", content: "CivicWatch NG — Anonymous Civic Tip-off Platform" },
      {
        property: "og:description",
        content:
          "A secure channel for Nigerians to report crime, corruption and civic hazards anonymously and track what happens next.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: Paperclip,
    title: "Describe what you saw",
    body: "Pick a category, tell us what happened, and attach photos, video, audio or documents as evidence.",
  },
  {
    icon: MapPin,
    title: "Add where it happened",
    body: "Type the location or share your device's coordinates so responders know exactly where to look.",
  },
  {
    icon: EyeOff,
    title: "Stay anonymous if you choose",
    body: "Anonymous reports store no name, email, phone or account link — only what you typed.",
  },
  {
    icon: Search,
    title: "Track with your reference code",
    body: "Every submission returns a unique code. Use it to follow the status without identifying yourself.",
  },
];

function Index() {
  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_stats");
      if (error) throw error;
      return data as { total: number; resolved: number; in_progress: number };
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-hero-gradient text-surface-foreground">
          <img
            src={heroImage}
            alt="Stylised Nigerian city skyline with glowing report location pins"
            width={1600}
            height={1104}
            className="absolute inset-0 size-full object-cover opacity-35"
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-surface-foreground/20 bg-surface-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                <ShieldCheck className="size-3.5" /> Anonymous by default
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                What you know can <span className="text-gradient-accent">save a life</span>.
                Report it safely.
              </h1>
              <p className="mt-5 max-w-xl text-base text-surface-foreground/80 sm:text-lg">
                CivicWatch NG is a secure, web-based civic tip-off system. Submit crime,
                corruption and public-safety concerns to the relevant authority — with evidence,
                with location, and without revealing who you are.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/report">
                    Submit a tip-off <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/track">Track an existing report</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 self-center">
              {[
                { label: "Tip-offs received", value: stats?.total ?? 0 },
                { label: "Being acted on", value: stats?.in_progress ?? 0 },
                { label: "Resolved", value: stats?.resolved ?? 0 },
                { label: "Concern categories", value: CATEGORIES.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-surface-foreground/15 bg-surface-foreground/10 p-5 backdrop-blur"
                >
                  <p className="font-display text-3xl font-semibold">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-surface-foreground/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="font-display text-3xl font-semibold">How it works</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Four steps, no station visit, no phone call, no paperwork.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Card key={step.title} className="border-border/70 shadow-soft">
                <CardContent className="pt-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-muted/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="font-display text-3xl font-semibold">What you can report</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <div
                  key={c.value}
                  className="rounded-xl border border-border bg-card p-5 shadow-soft"
                >
                  <h3 className="text-base font-semibold">{c.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold">
                Built for people who fear coming forward
              </h2>
              <p className="mt-4 text-muted-foreground">
                Research on crime reporting in Nigeria consistently finds that people withhold
                information not because they lack it, but because they fear retaliation, exposure
                or extortion once identified. CivicWatch NG removes identity from the equation.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Anonymous submissions store no name, contact detail or account link.",
                  "Evidence files are kept in private storage, readable only by verified authority staff.",
                  "Reporters follow progress through a reference code — never a personal account.",
                  "Data handling follows the purpose-limitation and confidentiality principles of the NDPA 2023.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="self-start border-border/70 shadow-elevated">
              <CardContent className="pt-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                  <Gauge className="size-5" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">For authorities</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Verified agency personnel get a dashboard of incoming tip-offs with category
                  filters, priority triage, geolocation, evidence access and a status trail that
                  reporters can follow.
                </p>
                <Button asChild variant="outline" className="mt-5">
                  <Link to="/auth">Authority login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
