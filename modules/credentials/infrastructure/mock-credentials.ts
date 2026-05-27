import { CredentialDetail, CredentialItem } from "@/modules/credentials/domain/credential.types";

const MOCK_EVENT_COVERS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2000&auto=format&fit=crop",
];

const DEMO_CREDENTIALS: CredentialItem[] = [
  {
    id: "cred-demo-portfolio",
    type: "Certificate",
    title: "Medelverse Demo - UX Design Certificate",
    description:
      "Completed advanced UX research and prototyping with distinction.",
    issuedOn: "May 1, 2026",
    organization: "Medalverse Academy",
    isVerified: true,
    category: "portfolio",
    issuerLogo: "/assets/icons/cone.svg",
    coverImage: MOCK_EVENT_COVERS[0],
  },
  {
    id: "cred-demo-hackathon",
    type: "Trophy",
    title: "Medelverse Demo - AI Hackathon Winner",
    description: "First place at the AI Hackathon 2026 in Bangkok.",
    issuedOn: "Jun 15, 2026",
    organization: "Chulalongkorn University",
    isVerified: true,
    category: "events",
    issuerLogo: "/assets/icons/cone.svg",
    coverImage: MOCK_EVENT_COVERS[1],
  },
  {
    id: "cred-demo-workshop",
    type: "Badge",
    title: "Medelverse Demo - Startup Workshop",
    description: "Participated in a 3-day entrepreneurship and pitching workshop.",
    issuedOn: "Jul 10, 2026",
    organization: "Thammasat University",
    isVerified: true,
    category: "events",
    issuerLogo: "/assets/icons/cone.svg",
    coverImage: MOCK_EVENT_COVERS[2],
  },
];

const BASE_CREDENTIALS: CredentialItem[] = [
  ...DEMO_CREDENTIALS,
  ...Array.from({ length: 26 }, (_, index) => ({
  id: `cred-${index + 1}`,
  type: "Trophy",
  title: index % 2 === 0 ? "Tech Innovation Summit USA 2025" : "Global AI Innovation Award 2026",
  description:
    "Join us for a spectacular evening at the Annual Gala of Excellence, where we celebrate outstanding achievements in our community.",
  issuedOn: "Oct 1, 2024",
  organization: "Medalverze",
  isVerified: true,
  category: index % 3 === 0 ? "portfolio" : "events",
  issuerLogo: "/app/assets/icons/cone.svg",
  coverImage: MOCK_EVENT_COVERS[index % MOCK_EVENT_COVERS.length],
  })),
];

export function queryMockCredentials(query: {
  search: string;
  tab: "all" | "events";
  page: number;
  pageSize: number;
}) {
  const search = query.search.trim().toLowerCase();

  let items = BASE_CREDENTIALS.filter((item) => {
    if (query.tab === "events" && item.category !== "events") {
      return false;
    }

    if (!search) {
      return true;
    }

    return `${item.title} ${item.organization}`.toLowerCase().includes(search);
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);

  items = items.slice((page - 1) * query.pageSize, page * query.pageSize);

  return { items, total, totalPages, page, pageSize: query.pageSize };
}

export function getMockCredentialById(id: string): CredentialDetail | null {
  const credential = BASE_CREDENTIALS.find((item) => item.id === id);
  if (!credential) {
    return null;
  }

  return {
    credential: {
      ...credential,
      title: "Tech Innovation Summit USA 2025",
    },
    recipientName: "Daniel Lee",
    credentialId: `MV-${id.toUpperCase()}-2024`,
    credentialCategory: "Badge",
    organizationAbbreviation: "NASA",
    organizationName: "National Aeronautics and Space Administration",
    rank: "First place",
    issueDate: "24/12/2025",
    expiryDate: "No Expiration",
    keyLearning:
      "Through this experience, I strengthened my ability to balance user needs with business and technical constraints. I learned how to communicate design decisions more clearly with cross-functional teams, especially when aligning with developers and stakeholders under tight timelines. I also improved my problem-solving skills by identifying pain points, simplifying complex flows, and proposing practical design solutions that could be implemented efficiently. Most importantly, I developed a deeper understanding of how thoughtful UX decisions can create both user value and business impact.",
    skills: ["Leadership", "Innovation", "Critical Thinking", "Presentation", "AI Literacy"],
    evidence: ["Final project evaluation", "Jury scoring sheet", "Event completion record"],
    verifyUrl: `https://medalverse.ai/verify/${id}`,
  };
}
