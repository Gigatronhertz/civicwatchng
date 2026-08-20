import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, type CategoryValue } from "@/lib/civic";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Submit an Anonymous Tip-off — CivicWatch NG" },
      {
        name: "description",
        content:
          "Report crime, corruption or a public-safety hazard in Nigeria. Attach evidence, add a location and stay completely anonymous.",
      },
      { property: "og:title", content: "Submit an Anonymous Tip-off — CivicWatch NG" },
      {
        property: "og:description",
        content:
          "A secure form to report civic concerns with evidence and location, anonymously, and receive a tracking code.",
      },
    ],
  }),
  component: ReportPage,
});

const MAX_FILE_MB = 25;

function ReportPage() {
  const [category, setCategory] = useState<CategoryValue>("crime");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [incidentAt, setIncidentAt] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support location sharing.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Coordinates attached to this report.");
      },
      () => toast.error("Could not read your location. You can type it instead."),
    );
  };

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const tooBig = picked.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      toast.error(`"${tooBig.name}" is larger than ${MAX_FILE_MB}MB.`);
      return;
    }
    setFiles(picked.slice(0, 5));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 5) {
      toast.error("Give the report a short subject (at least 5 characters).");
      return;
    }
    if (details.trim().length < 20) {
      toast.error("Please describe what happened in a bit more detail.");
      return;
    }
    setSubmitting(true);
    try {
      const folder = crypto.randomUUID();
      const paths: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${folder}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("evidence").upload(path, file);
        if (upErr) throw upErr;
        paths.push(path);
      }

      const { data, error } = await supabase
        .from("reports")
        .insert({
          category,
          subject: subject.trim(),
          details: details.trim(),
          location_text: locationText.trim() || null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          incident_at: incidentAt ? new Date(incidentAt).toISOString() : null,
          is_anonymous: anonymous,
          contact_email: anonymous ? null : contactEmail.trim() || null,
          contact_phone: anonymous ? null : contactPhone.trim() || null,
          evidence_paths: paths,
        })
        .select("reference_code")
        .single();

      if (error) throw error;
      setReference(data.reference_code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <section className="mx-auto max-w-2xl px-4 py-20">
            <Card className="border-border/70 shadow-elevated">
              <CardContent className="pt-8 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-6" />
                </span>
                <h1 className="mt-5 font-display text-3xl font-semibold">Report submitted</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Save this reference code. It is the only way to follow your report.
                </p>
                <p className="mt-6 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-4 font-mono text-2xl font-semibold tracking-wider">
                  {reference}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(reference);
                      toast.success("Reference code copied.");
                    }}
                  >
                    <Copy className="size-4" /> Copy code
                  </Button>
                  <Button asChild>
                    <Link to="/track">Track this report</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-14 sm:py-18">
          <h1 className="font-display text-4xl font-semibold">Submit a tip-off</h1>
          <p className="mt-3 text-muted-foreground">
            Anonymous by default. Nothing that identifies you is stored unless you switch it on
            yourself.
          </p>

          <form onSubmit={submit} className="mt-10 space-y-8">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryValue)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {CATEGORIES.find((c) => c.value === category)?.hint}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary, e.g. Bribery at a checkpoint on Airport Road"
                maxLength={140}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">What happened?</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={7}
                placeholder="Describe what you saw, who was involved, when it happened and anything else that could help responders."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="Street, area, LGA, state"
                />
                <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                  <MapPin className="size-4" />
                  {coords ? "Coordinates attached" : "Use my current location"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident">When did it happen?</Label>
                <Input
                  id="incident"
                  type="datetime-local"
                  value={incidentAt}
                  onChange={(e) => setIncidentAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">Evidence (optional, up to 5 files, {MAX_FILE_MB}MB each)</Label>
              <Input
                id="evidence"
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={(e) => onFiles(e.target.files)}
              />
              {files.length > 0 && (
                <ul className="text-xs text-muted-foreground">
                  {files.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">Submit anonymously</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep this on and no name, email, phone or account link is stored with your
                    report.
                  </p>
                </div>
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
              </div>

              {!anonymous && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact phone</Label>
                    <Input
                      id="phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Submitting…" : "Submit tip-off"}
            </Button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
