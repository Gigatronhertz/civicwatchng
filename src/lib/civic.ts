export const CATEGORIES = [
  { value: "crime", label: "Crime & security threat", hint: "Armed robbery, kidnapping, banditry, violence" },
  { value: "corruption", label: "Corruption & financial crime", hint: "Bribery, extortion, misuse of public funds" },
  { value: "public_safety", label: "Public safety hazard", hint: "Fire risk, collapsed structure, road danger" },
  { value: "environment", label: "Environmental concern", hint: "Illegal dumping, pollution, oil spill" },
  { value: "infrastructure", label: "Infrastructure failure", hint: "Broken utilities, damaged public facilities" },
  { value: "other", label: "Other civic concern", hint: "Anything else the authorities should know" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Closed / not actionable" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function statusLabel(value: string) {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function statusTone(value: string) {
  switch (value) {
    case "resolved":
      return "bg-success/15 text-success border-success/30";
    case "in_progress":
      return "bg-accent/20 text-accent-foreground border-accent/40";
    case "under_review":
      return "bg-primary/10 text-primary border-primary/25";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/25";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function priorityTone(value: string) {
  switch (value) {
    case "critical":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "high":
      return "bg-warning/20 text-warning-foreground border-warning/40";
    case "medium":
      return "bg-secondary text-secondary-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
