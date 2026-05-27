import {
  DashboardEvent,
  EventDetail,
  EventCredential,
  EventField,
  EventLevel,
  SortKey,
  EventType,
  EventsQuery,
} from "@/modules/experience/domain/dashboard.types";

const titles = [
  "Introduction to Web Development",
  "UX Research for Digital Products",
  "Blockchain Fundamentals for Beginners",
  "AI for Business Decision Making",
  "Product Management Essentials",
  "Data Analytics with Python",
  "Cybersecurity Awareness Workshop",
];

const universities = [
  "Chulalongkorn University",
  "Kasetsart University",
  "Thammasat University",
  "Mahidol University",
  "MIT",
];

const cities = ["Bangkok", "Chiang Mai", "Phuket", "Nakhon Ratchasima", "Khon Kaen"];
const countries = ["Thailand", "Singapore", "Japan"];

const eventTypes: EventType[] = [
  "Short Course",
  "Bootcamp",
  "Workshop",
  "Internship",
  "Volunteer Program",
  "Social Event",
  "Masterclass",
  "Conference",
];

const eventFields: EventField[] = [
  "Academic & Intellectual",
  "Business & Economics",
  "Science & Research",
  "Engineering & Technology",
  "Mathematics & Data",
  "Social Sciences",
  "Law, Policy & Governance",
  "Arts & Design",
];

const eventLevels: EventLevel[] = [
  "School Level",
  "Local / District Level",
  "Provincial / City Level",
  "Regional / State Level",
  "National Level",
  "International Level",
];

const images = [
  "/app/assets/cards/card-01.svg",
  "/app/assets/cards/card-02.svg",
  "/app/assets/cards/card-03.svg",
  "/app/assets/cards/card-04.svg",
  "/app/assets/cards/card-05.svg",
];

const themes = [
  "from-cyan-900 via-slate-800 to-blue-900",
  "from-violet-900 via-indigo-900 to-slate-900",
  "from-blue-950 via-slate-900 to-cyan-900",
  "from-fuchsia-200 via-rose-100 to-slate-100",
  "from-amber-700 via-rose-700 to-orange-900",
];

function makeItem(index: number): DashboardEvent {
  const title = titles[index % titles.length];
  const university = universities[index % universities.length];
  const city = cities[index % cities.length];
  const country = countries[index % countries.length];
  const day = (index % 27) + 1;
  const month = ["Oct", "Nov", "Dec"][index % 3];

  const alternatingRegistered = false;
  const alternatingHistory = false;

  return {
    id: `event-${index + 1}`,
    title,
    university,
    date: `${month} ${day}, 2025`,
    time: index % 4 === 0 ? "Time to be announced" : "9:30 AM - 12:00 PM",
    location: index % 5 === 0 ? "Online Event" : `${city}, ${country}`,
    seats: `${50 + (index % 5) * 10} seats`,
    price: index % 3 === 0 ? "Free Registration" : "299 THB",
    sponsored: index % 2 === 0,
    theme: themes[index % themes.length],
    image: images[index % images.length],
    isBookmarked: false,
    // Alternate between registered/history to make tab testing clearer.
    isRegistered: alternatingRegistered,
    isHistory: alternatingHistory,
    type: eventTypes[index % eventTypes.length],
    field: eventFields[index % eventFields.length],
    level: eventLevels[index % eventLevels.length],
    city,
    country,
  };
}

const DEMO_EVENTS: DashboardEvent[] = [
  {
    id: "event-demo-hackathon",
    title: "Medelverse Demo - AI Hackathon 2026",
    university: "Chulalongkorn University",
    date: "Jun 15, 2026",
    time: "9:00 AM - 6:00 PM",
    location: "Bangkok, Thailand",
    seats: "120 seats",
    price: "Free Registration",
    sponsored: true,
    theme: "from-cyan-900 via-slate-800 to-blue-900",
    image: "/assets/cards/card-01.svg",
    isBookmarked: false,
    isRegistered: false,
    isHistory: false,
    type: "Workshop",
    field: "Engineering & Technology",
    level: "National Level",
    city: "Bangkok",
    country: "Thailand",
  },
  {
    id: "event-demo-startup",
    title: "Medelverse Demo - Startup Bootcamp",
    university: "Thammasat University",
    date: "Jul 10, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Bangkok, Thailand",
    seats: "80 seats",
    price: "Free Registration",
    sponsored: true,
    theme: "from-violet-900 via-indigo-900 to-slate-900",
    image: "/assets/cards/card-02.svg",
    isBookmarked: false,
    isRegistered: false,
    isHistory: false,
    type: "Bootcamp",
    field: "Business & Economics",
    level: "Regional / State Level",
    city: "Bangkok",
    country: "Thailand",
  },
  {
    id: "event-demo-ux",
    title: "Medelverse Demo - UX Masterclass",
    university: "Mahidol University",
    date: "Aug 20, 2026",
    time: "1:00 PM - 5:00 PM",
    location: "Online Event",
    seats: "200 seats",
    price: "299 THB",
    sponsored: false,
    theme: "from-blue-950 via-slate-900 to-cyan-900",
    image: "/assets/cards/card-03.svg",
    isBookmarked: false,
    isRegistered: false,
    isHistory: false,
    type: "Masterclass",
    field: "Arts & Design",
    level: "International Level",
    city: "Bangkok",
    country: "Thailand",
  },
];

const MOCK_EVENTS: DashboardEvent[] = [
  ...DEMO_EVENTS,
  ...Array.from({ length: 80 }, (_, i) => makeItem(i)),
];
// Ensure clear mock cases for tab/register flow (skip demo entries at the front).
const demoOffset = DEMO_EVENTS.length;
if (MOCK_EVENTS[demoOffset]) {
  MOCK_EVENTS[demoOffset].date = "Oct 15, 2026";
  MOCK_EVENTS[demoOffset].isRegistered = false;
  MOCK_EVENTS[demoOffset].isHistory = false;
}
if (MOCK_EVENTS[demoOffset + 1]) {
  MOCK_EVENTS[demoOffset + 1].date = "Nov 5, 2026";
  MOCK_EVENTS[demoOffset + 1].isRegistered = false;
  MOCK_EVENTS[demoOffset + 1].isHistory = false;
}
if (MOCK_EVENTS[demoOffset + 2]) {
  MOCK_EVENTS[demoOffset + 2].date = "Dec 5, 2025";
  MOCK_EVENTS[demoOffset + 2].isRegistered = false;
  MOCK_EVENTS[demoOffset + 2].isHistory = true;
}
if (MOCK_EVENTS[demoOffset + 3]) {
  MOCK_EVENTS[demoOffset + 3].date = "Oct 16, 2025";
  MOCK_EVENTS[demoOffset + 3].isRegistered = false;
  MOCK_EVENTS[demoOffset + 3].isHistory = true;
}
if (MOCK_EVENTS[demoOffset + 4]) {
  MOCK_EVENTS[demoOffset + 4].date = "Jan 20, 2026";
  MOCK_EVENTS[demoOffset + 4].isRegistered = true;
  MOCK_EVENTS[demoOffset + 4].isHistory = false;
}
if (MOCK_EVENTS[demoOffset + 5]) {
  MOCK_EVENTS[demoOffset + 5].date = "Feb 10, 2026";
  MOCK_EVENTS[demoOffset + 5].isRegistered = true;
  MOCK_EVENTS[demoOffset + 5].isHistory = false;
}
const PERSON_AVATARS = [
  "/app/assets/logos/medalverse-logo.svg",
  "/app/assets/logos/medalverse-logo.svg",
  "/app/assets/logos/medalverse-logo.svg",
];

const MONTH_ORDER: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function parseEventDate(value: string) {
  const match = value.match(/^([A-Za-z]{3})\s(\d{1,2}),\s(\d{4})$/);
  if (!match) {
    return 0;
  }
  const [, mon, day, year] = match;
  return new Date(Number(year), (MONTH_ORDER[mon] ?? 1) - 1, Number(day)).getTime();
}

function applySort(items: DashboardEvent[], sort: SortKey) {
  const sorted = [...items];

  if (sort === "latest") {
    sorted.sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));
    return sorted;
  }

  if (sort === "oldest") {
    sorted.sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));
    return sorted;
  }

  if (sort === "title_asc") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }

  sorted.sort((a, b) => b.title.localeCompare(a.title));
  return sorted;
}

export function getEventsFilterOptions() {
  return {
    types: eventTypes,
    fields: eventFields,
    levels: eventLevels,
  };
}

export function queryMockEvents(query: EventsQuery) {
  const normalizedSearch = query.search.trim().toLowerCase();

  let items = MOCK_EVENTS.filter((event) => {
    if (query.tab === "bookmark" && !event.isBookmarked) {
      return false;
    }

    if (query.tab === "register" && !event.isRegistered) {
      return false;
    }

    if (query.tab === "history" && !event.isHistory) {
      return false;
    }

    if (normalizedSearch) {
      const searchable = `${event.title} ${event.university} ${event.location}`.toLowerCase();
      if (!searchable.includes(normalizedSearch)) {
        return false;
      }
    }

    if (query.types.length > 0 && !query.types.includes(event.type)) {
      return false;
    }

    if (query.fields.length > 0 && !query.fields.includes(event.field)) {
      return false;
    }

    if (query.levels.length > 0 && !query.levels.includes(event.level)) {
      return false;
    }

    if (query.location.trim()) {
      const keyword = query.location.trim().toLowerCase();
      const target = `${event.city} ${event.country} ${event.location}`.toLowerCase();
      if (!target.includes(keyword)) {
        return false;
      }
    }

    return true;
  });

  items = applySort(items, query.sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const safePage = Math.min(Math.max(1, query.page), totalPages);
  const start = (safePage - 1) * query.pageSize;
  const end = start + query.pageSize;
  items = items.slice(start, end);

  return {
    items,
    page: safePage,
    pageSize: query.pageSize,
    total,
    totalPages,
  };
}

export function getMockEventById(eventId: string): DashboardEvent | null {
  return MOCK_EVENTS.find((event) => event.id === eventId) ?? null;
}

export function getRecommendedEvents(eventId: string, count = 4) {
  const sourceEvent = getMockEventById(eventId);
  if (!sourceEvent) {
    return [];
  }

  return MOCK_EVENTS
    .filter((event) => event.id !== eventId && event.type === sourceEvent.type)
    .slice(0, count);
}

export function getMockEventDetail(eventId: string): EventDetail | null {
  const event = getMockEventById(eventId);
  if (!event) {
    return null;
  }

  const isProductManagementEssentials = event.title === "Product Management Essentials";

  const overview = isProductManagementEssentials
    ? "This intensive Product Management Essentials workshop is built for learners who want to understand how successful digital products are planned, launched, and improved. You will explore the end-to-end product lifecycle, from identifying user pain points and validating ideas to defining strategy, prioritizing features, and measuring impact. Through case-based activities, you will practice framing product goals, writing clear problem statements, and translating research findings into actionable roadmaps. The session also covers stakeholder communication, experiment design, and decision-making under constraints so you can balance business outcomes with user value. By the end of the workshop, you will be able to structure product discovery, align cross-functional teams, and present product recommendations with confidence understand how successful digital products are planned, launched, and improved. You will explore the end-to-end product lifecycle, from identifying user pain points and validating ideas to defining strategy, prioritizing features, and measuring impact. Through case-based activities, you will practice framing product goals, writing clear problem statements, and translating research findings into actionable roadmaps. The session also covers stakeholder communication, experiment design, and decision-making under constraints so you can balance business outcomes with user value. By the end of the workshop, you will be able to structure product discovery, align cross-functional teams, and present product recommendations with confidence."
    : "Join us for an immersive session designed for beginners and intermediate learners. You will build practical foundations, work on mini projects, and receive mentoring to accelerate your learning journey.";

  const speakers = isProductManagementEssentials
    ? [
        {
          id: "spk-pm-1",
          name: "Maya Chen",
          role: "Senior Product Manager, Fintech Platform",
          avatar: PERSON_AVATARS[0],
          bio: "A senior product practitioner focused on turning user research insights into product strategy, roadmaps, and measurable business outcomes.",
        },
        {
          id: "spk-pm-2",
          name: "Dr. Narin Vong",
          role: "Product Strategy Lead, Digital Banking",
          avatar: PERSON_AVATARS[1],
          bio: "Leads cross-functional strategy initiatives and specializes in product discovery, prioritization frameworks, and stakeholder alignment.",
        },
        {
          id: "spk-pm-3",
          name: "Alice Wattanakul",
          role: "Head of UX Research, Growth Products",
          avatar: PERSON_AVATARS[2],
          bio: "Combines UX research with growth experimentation to help teams design user-centric products that scale with confidence.",
        },
        {
          id: "spk-pm-4",
          name: "Krit Charoensri",
          role: "Principal Product Analyst, Data & Experimentation",
          avatar: PERSON_AVATARS[0],
          bio: "Specializes in analytics-driven product decision making, experiment design, and product performance optimization.",
        },
      ]
    : [
        {
          id: "spk-1",
          name: "Dr. Sarah Johnson",
          role: "Professor of Computer Science",
          avatar: PERSON_AVATARS[0],
          bio: "A senior academic specializing in computer science research and education, with expertise in areas such as artificial intelligence.",
        },
        {
          id: "spk-2",
          name: "Dr. Sarah Johnson",
          role: "Professor of Computer Science",
          avatar: PERSON_AVATARS[1],
          bio: "A senior academic specializing in computer science research and education, with expertise in areas such as artificial intelligence.",
        },
        {
          id: "spk-3",
          name: "Dr. Sarah Johnson",
          role: "Professor of Computer Science",
          avatar: PERSON_AVATARS[2],
          bio: "A senior academic specializing in computer science research and education, with expertise in areas such as artificial intelligence.",
        },
      ];

  const credentials: EventCredential[] = [
    {
      id: `${event.id}-credential-1`,
      type: "Trophy",
      title: `Winner of ${event.title}`,
      description: `An international award recognizing outstanding innovation and real-world impact in ${event.field.toLowerCase()}.`,
      organization: event.university,
      verified: true,
      requirement: "Attend the full workshop and complete the final project",
    },
    {
      id: `${event.id}-credential-2`,
      type: "Certificate",
      title: `${event.title} Certificate of Completion`,
      description: "Issued to participants who completed all required sessions and submitted the final assignment.",
      organization: event.university,
      verified: true,
      requirement: "Complete all sessions and submit the final assignment",
    },
  ];

  return {
    event,
    overview,
    eligibility: [
      "High School Students",
      "Undergraduate Students",
      "Graduate Students",
      "General Public",
    ],
    outcomes: [
      "Understand core concepts and practical workflows",
      "Apply tools and frameworks to real-world scenarios",
      "Build a portfolio-ready mini project",
      "Improve collaboration and communication in teams",
    ],
    agenda: [
      { time: "9:00 PM", topic: "Welcome & Introduction", description: "Overview of event and learning outcomes." },
      { time: "9:30 PM", topic: "Core Fundamentals", description: "Hands-on walkthrough of main concepts." },
      { time: "10:30 PM", topic: "Workshop Practice", description: "Interactive practice and feedback session." },
      { time: "11:30 PM", topic: "Q&A + Wrap Up", description: "Summary and next-step recommendations." },
    ],
    speakers,
    organizer: {
      name: "Medalverse",
      verified: true,
      followers: 12,
      events: 12,
      hostingYears: 12,
      avatar: "/app/assets/logos/medalverse-logo.svg",
    },
    venue: {
      name: event.university,
      address: "254 Phaya Thai Rd, Wang Mai, Pathum Wan, Bangkok 10330",
    },
    credentials,
    gallery: [
      "/app/assets/cards/card-01.svg",
      "/app/assets/cards/card-02.svg",
      "/app/assets/cards/card-03.svg",
      "/app/assets/cards/card-04.svg",
      "/app/assets/cards/card-05.svg",
    ],
    recommended: getRecommendedEvents(event.id, 4),
  };
}
