/**
 * Browser-session demo store for CivicWatch NG.
 * Everything (reports, updates, authority session) is persisted in the visitor's
 * own browser so the prototype behaves like a live system without a backend.
 */
import { useSyncExternalStore } from "react";
import type { CategoryValue, StatusValue } from "@/lib/civic";

export type PriorityValue = "low" | "medium" | "high" | "critical";

export type ReportUpdate = {
  note: string;
  status: StatusValue | null;
  is_public: boolean;
  author: string;
  created_at: string;
};

export type DemoReport = {
  id: string;
  reference_code: string;
  category: CategoryValue;
  subject: string;
  details: string;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  incident_at: string | null;
  status: StatusValue;
  priority: PriorityValue;
  is_anonymous: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  evidence_names: string[];
  created_at: string;
  updated_at: string;
  updates: ReportUpdate[];
  mine?: boolean;
};

export type DemoUser = { email: string; name: string; role: "admin" | "officer" };

type StoreState = { reports: DemoReport[]; session: DemoUser | null };

const STORAGE_KEY = "civicwatch:demo:v1";
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const DEMO_ACCOUNTS: Array<DemoUser & { password: string }> = [
  {
    email: "admin@civicwatch.ng",
    password: "civicwatch",
    name: "Amaka Obi",
    role: "admin",
  },
  {
    email: "officer@civicwatch.ng",
    password: "civicwatch",
    name: "Tunde Bakare",
    role: "officer",
  },
];

function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString();
}

export function generateReferenceCode(existing: string[] = []): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = "CTS-";
    for (let i = 0; i < 8; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    if (!existing.includes(code)) return code;
  }
  return `CTS-${Date.now().toString(36).toUpperCase().slice(-8)}`;
}

function seedReports(): DemoReport[] {
  return [
    {
      id: "seed-1",
      reference_code: "CTS-K7WQ2M4X",
      category: "corruption",
      subject: "Officers collecting cash at Airport Road checkpoint",
      details:
        "Between 7pm and 10pm daily, uniformed officers at the checkpoint before the second bridge stop commercial drivers and collect ₦500 to ₦2,000 before letting them pass. Drivers who refuse are delayed for over an hour.",
      location_text: "Airport Road checkpoint, Benin City, Edo State",
      latitude: 6.3176,
      longitude: 5.5996,
      incident_at: daysAgo(9, 3),
      status: "in_progress",
      priority: "high",
      is_anonymous: true,
      contact_email: null,
      contact_phone: null,
      evidence_names: ["checkpoint-clip.mp4", "receipt-photo.jpg"],
      created_at: daysAgo(9),
      updated_at: daysAgo(1),
      updates: [
        {
          note: "Report received and routed to the state anti-corruption desk.",
          status: "under_review",
          is_public: true,
          author: "Amaka Obi",
          created_at: daysAgo(8),
        },
        {
          note: "Field verification team deployed to the location for three evening cycles.",
          status: "in_progress",
          is_public: true,
          author: "Tunde Bakare",
          created_at: daysAgo(1),
        },
      ],
    },
    {
      id: "seed-2",
      reference_code: "CTS-4RNB9TCF",
      category: "public_safety",
      subject: "Collapsing balcony over a busy walkway",
      details:
        "A three-storey building beside the market has a cracked concrete balcony hanging over the pedestrian walkway. Pieces have already fallen twice this month and traders sit directly underneath.",
      location_text: "Oja Oba market frontage, Ilorin, Kwara State",
      latitude: 8.4966,
      longitude: 4.5421,
      incident_at: daysAgo(5, 6),
      status: "resolved",
      priority: "critical",
      is_anonymous: false,
      contact_email: "concerned.trader@example.com",
      contact_phone: "+234 802 000 1122",
      evidence_names: ["balcony-crack.jpg"],
      created_at: daysAgo(5),
      updated_at: daysAgo(0, 20),
      updates: [
        {
          note: "Emergency management agency notified; area cordoned off within 24 hours.",
          status: "in_progress",
          is_public: true,
          author: "Amaka Obi",
          created_at: daysAgo(4),
        },
        {
          note: "Structure demolished and walkway reopened. Thank you for the report.",
          status: "resolved",
          is_public: true,
          author: "Amaka Obi",
          created_at: daysAgo(0, 20),
        },
      ],
    },
    {
      id: "seed-3",
      reference_code: "CTS-Z2XJ8HDP",
      category: "crime",
      subject: "Repeated night robberies along a residential street",
      details:
        "For the past two weeks, a group on two motorcycles has been robbing residents returning home between 9pm and 11pm on the same street. Three incidents happened this week alone.",
      location_text: "Off Rumuokwuta Road, Port Harcourt, Rivers State",
      latitude: 4.8396,
      longitude: 6.9954,
      incident_at: daysAgo(2, 12),
      status: "under_review",
      priority: "critical",
      is_anonymous: true,
      contact_email: null,
      contact_phone: null,
      evidence_names: [],
      created_at: daysAgo(2),
      updated_at: daysAgo(2),
      updates: [
        {
          note: "Assigned to the divisional response unit for night patrol planning.",
          status: "under_review",
          is_public: true,
          author: "Tunde Bakare",
          created_at: daysAgo(2),
        },
      ],
    },
    {
      id: "seed-4",
      reference_code: "CTS-M6VD3QYS",
      category: "environment",
      subject: "Tanker discharging waste into a stream at night",
      details:
        "A tanker parks by the bridge around 1am and empties dark liquid into the stream that feeds the community water point. The water has smelled of fuel for a week.",
      location_text: "Elelenwo stream bridge, Rivers State",
      latitude: 4.8412,
      longitude: 7.0553,
      incident_at: daysAgo(12),
      status: "submitted",
      priority: "high",
      is_anonymous: true,
      contact_email: null,
      contact_phone: null,
      evidence_names: ["stream-sample.jpg", "night-audio.m4a"],
      created_at: daysAgo(12),
      updated_at: daysAgo(12),
      updates: [],
    },
    {
      id: "seed-5",
      reference_code: "CTS-B9FH5KTR",
      category: "infrastructure",
      subject: "Street transformer sparking near a school",
      details:
        "The transformer at the school junction sparks heavily whenever power is restored and the fence around it is broken, so children walk right past the live cables.",
      location_text: "Community primary school junction, Abeokuta, Ogun State",
      latitude: 7.1475,
      longitude: 3.3619,
      incident_at: daysAgo(20),
      status: "rejected",
      priority: "medium",
      is_anonymous: true,
      contact_email: null,
      contact_phone: null,
      evidence_names: [],
      created_at: daysAgo(20),
      updated_at: daysAgo(15),
      updates: [
        {
          note: "Referred to the distribution company; outside this agency's mandate. A separate ticket was opened with them.",
          status: "rejected",
          is_public: true,
          author: "Amaka Obi",
          created_at: daysAgo(15),
        },
      ],
    },
  ];
}

let state: StoreState = { reports: [], session: null };
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      state = {
        reports: Array.isArray(parsed.reports) ? parsed.reports : seedReports(),
        session: parsed.session ?? null,
      };
      return;
    }
  } catch {
    /* fall through to seed */
  }
  state = { reports: seedReports(), session: null };
  persist();
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): StoreState {
  hydrate();
  return state;
}

const SERVER_SNAPSHOT: StoreState = { reports: [], session: null };
function getServerSnapshot(): StoreState {
  return SERVER_SNAPSHOT;
}

export function useDemoStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function listReports(): DemoReport[] {
  hydrate();
  return [...state.reports].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function findReport(code: string): DemoReport | undefined {
  hydrate();
  const needle = code.trim().toUpperCase();
  return state.reports.find((r) => r.reference_code.toUpperCase() === needle);
}

export function createReport(
  input: Omit<
    DemoReport,
    "id" | "reference_code" | "status" | "priority" | "created_at" | "updated_at" | "updates" | "mine"
  >,
): DemoReport {
  hydrate();
  const now = new Date().toISOString();
  const report: DemoReport = {
    ...input,
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reference_code: generateReferenceCode(state.reports.map((r) => r.reference_code)),
    status: "submitted",
    priority: input.category === "crime" ? "high" : "medium",
    created_at: now,
    updated_at: now,
    updates: [
      {
        note: "Report received. It is queued for review by the relevant desk.",
        status: "submitted",
        is_public: true,
        author: "CivicWatch NG",
        created_at: now,
      },
    ],
    mine: true,
  };
  state = { ...state, reports: [report, ...state.reports] };
  emit();
  return report;
}

export function addUpdate(
  reportId: string,
  update: { note: string; status: StatusValue | null; is_public: boolean; author: string },
) {
  hydrate();
  const now = new Date().toISOString();
  state = {
    ...state,
    reports: state.reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: update.status ?? r.status,
            updated_at: now,
            updates: [...r.updates, { ...update, created_at: now }],
          }
        : r,
    ),
  };
  emit();
}

export function setPriority(reportId: string, priority: PriorityValue) {
  hydrate();
  state = {
    ...state,
    reports: state.reports.map((r) =>
      r.id === reportId ? { ...r, priority, updated_at: new Date().toISOString() } : r,
    ),
  };
  emit();
}

export function stats() {
  hydrate();
  const reports = state.reports;
  return {
    total: reports.length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    in_progress: reports.filter((r) => r.status === "under_review" || r.status === "in_progress")
      .length,
  };
}

export function signIn(email: string, password: string): DemoUser | null {
  hydrate();
  const match = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );
  if (!match) return null;
  const user: DemoUser = { email: match.email, name: match.name, role: match.role };
  state = { ...state, session: user };
  emit();
  return user;
}

export function signOut() {
  hydrate();
  state = { ...state, session: null };
  emit();
}

export function resetDemoData() {
  state = { reports: seedReports(), session: state.session };
  emit();
}
