import { DashboardEvent, EventDetail } from "@/modules/experience/domain/dashboard.types";

const DEFAULT_IMAGES = [
  "/app/assets/cards/card-01.svg",
  "/app/assets/cards/card-02.svg",
  "/app/assets/cards/card-03.svg",
  "/app/assets/cards/card-04.svg",
  "/app/assets/cards/card-05.svg",
];

const DEFAULT_THEMES = [
  "from-cyan-900 via-slate-800 to-blue-900",
  "from-violet-900 via-indigo-900 to-slate-900",
  "from-blue-950 via-slate-900 to-cyan-900",
  "from-fuchsia-200 via-rose-100 to-slate-100",
  "from-amber-700 via-rose-700 to-orange-900",
];

const FALLBACK_TYPES = [
  "Short Course",
  "Bootcamp",
  "Workshop",
  "Internship",
  "Volunteer Program",
  "Social Event",
  "Masterclass",
  "Conference",
] as const;

const FALLBACK_FIELDS = [
  "Academic & Intellectual",
  "Business & Economics",
  "Science & Research",
  "Engineering & Technology",
  "Mathematics & Data",
  "Social Sciences",
  "Law, Policy & Governance",
  "Arts & Design",
] as const;

const FALLBACK_LEVELS = [
  "School Level",
  "Local / District Level",
  "Provincial / City Level",
  "Regional / State Level",
  "National Level",
  "International Level",
] as const;

type AnyRecord = Record<string, unknown>;

function toRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as AnyRecord;
}

function readValue(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

function readString(record: AnyRecord, keys: string[], fallback = "") {
  const value = readValue(record, keys);
  if (typeof value === "string") {
    return value;
  }
  return fallback;
}

function readNumber(record: AnyRecord, keys: string[], fallback = 0) {
  const value = readValue(record, keys);
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function readBoolean(record: AnyRecord, keys: string[], fallback = false) {
  const value = readValue(record, keys);
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return fallback;
}

function parseDateTime(value: string) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function formatDisplayDate(value: string) {
  const date = parseDateTime(value);
  if (!date) {
    return "Date to be announced";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDisplayTime(start: string, end: string) {
  const startDate = parseDateTime(start);
  const endDate = parseDateTime(end);
  if (!startDate && !endDate) {
    return "Time to be announced";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (startDate && endDate) {
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }

  if (startDate) {
    return formatter.format(startDate);
  }

  return formatter.format(endDate as Date);
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function pickImage(index: number) {
  return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
}

function pickTheme(index: number) {
  return DEFAULT_THEMES[index % DEFAULT_THEMES.length];
}

function mapStatusFlags(status: string) {
  const normalized = status.toUpperCase();
  return {
    isHistory: ["COMPLETED", "ARCHIVED", "ENDED", "CLOSED"].includes(normalized),
    isRegistered: ["PUBLISHED", "OPEN", "UPCOMING", "ONGOING"].includes(normalized),
  };
}

function mapType(value: string, index: number) {
  if (!value) {
    return FALLBACK_TYPES[index % FALLBACK_TYPES.length];
  }
  return (toTitleCase(value) as (typeof FALLBACK_TYPES)[number]) || FALLBACK_TYPES[index % FALLBACK_TYPES.length];
}

function mapField(value: string, index: number) {
  if (!value) {
    return FALLBACK_FIELDS[index % FALLBACK_FIELDS.length];
  }
  return (toTitleCase(value) as (typeof FALLBACK_FIELDS)[number]) || FALLBACK_FIELDS[index % FALLBACK_FIELDS.length];
}

function mapLevel(value: string, index: number) {
  if (!value) {
    return FALLBACK_LEVELS[index % FALLBACK_LEVELS.length];
  }
  return (toTitleCase(value) as (typeof FALLBACK_LEVELS)[number]) || FALLBACK_LEVELS[index % FALLBACK_LEVELS.length];
}

export function extractBackendListPayload(payload: unknown) {
  const root = toRecord(payload);
  if (!root) {
    return {
      items: [] as AnyRecord[],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
  }

  const directData = root.data;
  const nestedData = toRecord(directData)?.data;
  const items =
    (Array.isArray(directData) ? directData : null) ??
    (Array.isArray(nestedData) ? nestedData : null) ??
    [];

  const total = readNumber(root, ["total"]) || readNumber(toRecord(directData) ?? {}, ["total"]) || items.length;
  const page = readNumber(root, ["page"]) || readNumber(toRecord(directData) ?? {}, ["page"]) || 1;
  const pageSize = readNumber(root, ["page_size", "pageSize"]) || readNumber(toRecord(directData) ?? {}, ["page_size", "pageSize"]) || 10;
  const totalPages =
    readNumber(root, ["total_pages", "totalPages"]) ||
    readNumber(toRecord(directData) ?? {}, ["total_pages", "totalPages"]) ||
    Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

  return {
    items: items.map((item) => toRecord(item)).filter((item): item is AnyRecord => Boolean(item)),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function mapBackendEventToDashboard(event: AnyRecord, index = 0): DashboardEvent {
  const id = readString(event, ["id", "event_id"], `event-${index + 1}`);
  const title = readString(event, ["name", "title"], `Event ${index + 1}`);
  const university = readString(event, ["org_name", "organization_name", "university"], "Medalverse");
  const startAt = readString(event, ["start_at", "startAt"]);
  const endAt = readString(event, ["end_at", "endAt"]);
  const status = readString(event, ["status"], "DRAFT");
  const city = readString(event, ["city"], "Bangkok");
  const country = readString(event, ["country"], "Thailand");
  const locationText = readString(event, ["location_name", "location", "address"], `${city}, ${country}`);
  const remainingSeats = readNumber(event, ["remaining_seats", "remainingSeats"]);
  const capacity = readNumber(event, ["capacity"], 0);
  const typeValue = readString(event, ["event_type_name", "event_type", "type"]);
  const fieldValue = readString(event, ["field_name", "field"]);
  const levelValue = readString(event, ["competition_level_name", "competition_level", "level"]);
  const isBookmarked = readBoolean(event, ["is_bookmarked", "isBookmarked", "bookmarked"], false);
  const isSponsored = readBoolean(event, ["is_sponsored", "isSponsored"], false);
  const { isHistory, isRegistered } = mapStatusFlags(status);

  return {
    id,
    title,
    university,
    date: formatDisplayDate(startAt),
    time: formatDisplayTime(startAt, endAt),
    location: locationText || "Online Event",
    seats: `${Math.max(remainingSeats, 0) || Math.max(capacity, 0)} seats`,
    price: "Free Registration",
    sponsored: isSponsored,
    theme: pickTheme(index),
    image: pickImage(index),
    isBookmarked,
    isRegistered,
    isHistory,
    type: mapType(typeValue, index),
    field: mapField(fieldValue, index),
    level: mapLevel(levelValue, index),
    city,
    country,
  };
}

export function extractBackendDetailPayload(payload: unknown) {
  const root = toRecord(payload);
  if (!root) {
    return null;
  }

  const nested = toRecord(root.data);
  if (nested) {
    return nested;
  }

  return root;
}

export function mapDashboardEventToDetail(event: DashboardEvent, source?: AnyRecord, recommended: DashboardEvent[] = []): EventDetail {
  const description =
    readString(source ?? {}, ["description"], "") ||
    readString(source ?? {}, ["short_description", "shortDescription"], "") ||
    "Event description is not available.";
  const regDeadline =
    readString(source ?? {}, ["registration_deadline", "registrationDeadline"], "") || readString(source ?? {}, ["start_at", "startAt"], "");

  const mappedEvent = {
    ...event,
    date: regDeadline ? formatDisplayDate(regDeadline) : event.date,
  };

  return {
    event: mappedEvent,
    overview: description,
    eligibility: ["General Public"],
    outcomes: ["Learn from real event experience", "Expand professional network", "Receive participation recognition"],
    agenda: [
      { time: "09:00 AM", topic: "Opening", description: "Welcome and event introduction." },
      { time: "10:00 AM", topic: "Main Session", description: "Core event activities." },
      { time: "12:00 PM", topic: "Wrap Up", description: "Summary and next steps." },
    ],
    speakers: [],
    organizer: {
      name: event.university,
      verified: true,
      followers: 0,
      events: 0,
      hostingYears: 1,
      avatar: "/app/assets/logos/medalverse-logo.svg",
    },
    venue: {
      name: event.university,
      address: event.location,
    },
    credentials: [
      {
        id: `${event.id}-credential-1`,
        type: "Trophy",
        title: `Winner of ${event.title}`,
        description: "Awarded for outstanding performance and completion of event requirements.",
        organization: event.university,
        verified: true,
        requirement: "Attend the full workshop and complete the final project",
      },
    ],
    gallery: [event.image],
    recommended,
  };
}

export function getFallbackFilterOptions() {
  return {
    types: [...FALLBACK_TYPES],
    fields: [...FALLBACK_FIELDS],
    levels: [...FALLBACK_LEVELS],
  };
}
