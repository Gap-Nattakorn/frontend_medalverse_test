export type TabKey = "all" | "bookmark" | "register" | "history";
export type SortKey = "latest" | "oldest" | "title_asc" | "title_desc";

export type EventType =
  | "Short Course"
  | "Bootcamp"
  | "Workshop"
  | "Internship"
  | "Volunteer Program"
  | "Social Event"
  | "Masterclass"
  | "Conference";

export type EventField =
  | "Academic & Intellectual"
  | "Business & Economics"
  | "Science & Research"
  | "Engineering & Technology"
  | "Mathematics & Data"
  | "Social Sciences"
  | "Law, Policy & Governance"
  | "Arts & Design";

export type EventLevel =
  | "School Level"
  | "Local / District Level"
  | "Provincial / City Level"
  | "Regional / State Level"
  | "National Level"
  | "International Level";

export type DashboardEvent = {
  id: string;
  title: string;
  university: string;
  date: string;
  time: string;
  location: string;
  seats: string;
  price: string;
  sponsored?: boolean;
  theme: string;
  image: string;
  isBookmarked: boolean;
  isRegistered: boolean;
  isHistory: boolean;
  type: EventType;
  field: EventField;
  level: EventLevel;
  city: string;
  country: string;
};

export type EventsQuery = {
  tab: TabKey;
  page: number;
  pageSize: number;
  search: string;
  sort: SortKey;
  types: string[];
  fields: string[];
  levels: string[];
  location: string;
};

export type EventsApiResponse = {
  success: true;
  data: {
    items: DashboardEvent[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    filterOptions: {
      types: EventType[];
      fields: EventField[];
      levels: EventLevel[];
    };
  };
};

export type EventAgendaItem = {
  time: string;
  topic: string;
  description: string;
};

export type EventPerson = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio?: string;
};

export type EventCredential = {
  id: string;
  type: "Certificate" | "Trophy" | "Medal" | "Badge";
  title: string;
  description: string;
  organization: string;
  verified: boolean;
  requirement: string;
};

export type EventDetail = {
  event: DashboardEvent;
  overview: string;
  eligibility: string[];
  outcomes: string[];
  agenda: EventAgendaItem[];
  speakers: EventPerson[];
  organizer: {
    name: string;
    verified: boolean;
    followers: number;
    events: number;
    hostingYears: number;
    avatar: string;
  };
  venue: {
    name: string;
    address: string;
  };
  credentials: EventCredential[];
  gallery: string[];
  recommended: DashboardEvent[];
};

export type EventDetailApiResponse = {
  success: true;
  data: EventDetail;
};
