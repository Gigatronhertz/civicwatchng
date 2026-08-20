import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Data Protection — CivicWatch NG" },
      {
        name: "description",
        content:
          "How CivicWatch NG protects reporter anonymity, stores evidence securely and handles data under the Nigeria Data Protection Act 2023.",
      },
      { property: "og:title", content: "About & Data Protection — CivicWatch NG" },
      {
        property: "og:description",
        content:
          "Learn how anonymous civic tip-offs are handled, who can see evidence, and what data CivicWatch NG stores.",
      },
    ],
  }),
  component: AboutPage,
});

const sections = [
  {
    title: "What CivicWatch NG is",
    body: "A secure web channel that lets anyone in Nigeria pass crime, corruption and public-safety information to the responsible authority without visiting a station, calling a number, or naming themselves.",
  },
  {
    title: "What we store for anonymous reports",
    body: "Only what you type or attach: category, subject, details, optional location, optional incident time and any evidence files. No name, no email, no phone number, no account link, and no reporter identity of any kind.",
  },
  {
    title: "Evidence handling",
    body: "Files go to a private storage area that is not publicly readable. Only verified authority staff signed into the dashboard can open them, and access is scoped by role.",
  },
  {
    title: "Your reference code",
    body: "Every submission returns a unique code such as CTS-AB12CD34. It is the only way to follow the report, so keep it safe. Anyone with the code can view the report status and public updates, so do not share it carelessly.",
  },
  {
    title: "NDPA 2023 alignment",
    body: "Data is collected for one purpose — acting on the report — kept confidential, limited to what is necessary, and never sold or repurposed for marketing or profiling.",
  },
  {
    title: "Emergency situations",
    body: "CivicWatch NG is not a live emergency line. If a life is in immediate danger, contact emergency services directly first, then submit the tip-off here so the record and evidence are preserved.",
  },
];

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <h1 className="font-display text-4xl font-semibold">About & data protection</h1>
          <p className="mt-3 text-muted-foreground">
            Straight answers about what happens to a report after you press submit.
          </p>
          <div className="mt-10 grid gap-4">
            {sections.map((s) => (
              <Card key={s.title} className="border-border/70 shadow-soft">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
