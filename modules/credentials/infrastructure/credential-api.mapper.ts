import { CredentialDetail, CredentialItem } from "@/modules/credentials/domain/credential.types";

type AnyRecord = Record<string, unknown>;

function toRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as AnyRecord;
}

function getRealData(payload: unknown): AnyRecord {
  if (!payload || typeof payload !== 'object') return {};
  
  let current = payload as AnyRecord;
  
  if (Array.isArray(current)) {
    current = current[0];
  }
  
  if (current.data) return getRealData(current.data);
  if (current.items && Array.isArray(current.items)) return getRealData(current.items[0]);
  
  return current; 
}

function readValue(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") {
      return record[key];
    }
  }
  return undefined;
}

function readString(record: AnyRecord, keys: string[], fallback = "") {
  const value = readValue(record, keys);
  return typeof value === "string" ? value : fallback;
}

function readBoolean(record: AnyRecord, keys: string[], fallback = false) {
  const value = readValue(record, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function formatDisplayDate(value: string) {
  if (!value || value.startsWith("0001-01-01")) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function toTitleCase(value: string) {
  if (!value) return "";
  return value.toLowerCase().split(/[_\s-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function extractCredentialListPayload(payload: unknown) {
  const root = toRecord(payload);
  if (!root) return { items: [] as AnyRecord[], total: 0, page: 1, pageSize: 10, totalPages: 1 };
  const rootData = toRecord(root.data);
  const items = (Array.isArray(payload) ? payload : null) ?? (Array.isArray(root.data) ? root.data : null) ?? (Array.isArray(root.items) ? root.items : null) ?? (Array.isArray(root.credentials) ? root.credentials : null) ?? (Array.isArray(rootData?.data) ? (rootData?.data as unknown[]) : null) ?? (Array.isArray(rootData?.items) ? (rootData?.items as unknown[]) : null) ?? [];
  const itemRecords = items.map((item) => toRecord(item)).filter((item): item is AnyRecord => Boolean(item));
  const total = Number(readValue(root, ["total"])) || Number(readValue(rootData ?? {}, ["total"])) || itemRecords.length;
  const page = Number(readValue(root, ["page"])) || Number(readValue(rootData ?? {}, ["page"])) || 1;
  const pageSize = Number(readValue(root, ["page_size", "pageSize"])) || Number(readValue(rootData ?? {}, ["page_size", "pageSize"])) || 10;
  const totalPages = Number(readValue(root, ["total_pages", "totalPages"])) || Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return { items: itemRecords, total, page, pageSize, totalPages };
}

export function mapBackendCredentialToItem(rawPayload: AnyRecord): CredentialItem {

  const credential = getRealData(rawPayload);
  const id = readString(credential, ["credential_id", "id", "uuid", "_id"], `credential-${Date.now()}`);
  const type = toTitleCase(readString(credential, ["type", "credential_type"], "Badge")) || "Badge";
  const title = readString(credential, ["name", "title"], "Untitled credential");
  const description = readString(credential, ["description", "key_learning"], "No description");
  const issuedOn = formatDisplayDate(readString(credential, ["issue_date", "issued_on", "created_at"], ""));
  const organization = readString(credential, ["organization_name", "org_name", "organization", "issuer_name"], "") || "Medalverze";
  const isVerified = readBoolean(credential, ["is_verified", "verified"], true);
  const isPrivate = readBoolean(credential, ["private", "is_private"], false);
  const coverImage = readString(credential, ["cover_image", "coverImage", "image_url", "imageUrl", "thumbnail"], "") || "/app/assets/icons/cone.svg";
  const hasEvent = Boolean(readString(credential, ["event_id", "eventId"], ""));

  return {
    id,
    type,
    title,
    description,
    issuedOn,
    organization,
    isVerified,
    visibility: isPrivate ? "private" : "public",
    category: hasEvent ? "events" : "portfolio",
    issuerLogo: "/app/assets/icons/cone.svg",
    coverImage,
  };
}

export function mapBackendCredentialToDetail(item: CredentialItem, rawSource?: AnyRecord): CredentialDetail {
  const source = rawSource ? getRealData(rawSource) : {};
  const rank = readString(source, ["rank"], "N/A");
  const recipientName = readString(source, ["recipient_name", "recipientName"], "Recipient");
  const organizationAbbreviation = readString(source, ["organization_abbreviation", "organizationAbbreviation"], "MV");
  const keyLearning = readString(source, ["key_learning", "description"], "This credential has no additional details.");
  const eventData = getRealData(source.event || source);
  const eventName = readString(eventData, ["name", "title"], item.title);
  const eventDescription = readString(eventData, ["description"], item.description);
  const activityType = readString(eventData, ["event_type_raw", "activity_type"], "");
  const rawStartDate = readString(eventData, ["start_at", "start_date"], "");
  const rawEndDate = readString(eventData, ["end_at", "end_date"], "");
  const heldStartDate = rawStartDate ? formatDisplayDate(rawStartDate) : "";
  const heldEndDate = rawEndDate ? formatDisplayDate(rawEndDate) : "";

  return { credential: item, recipientName, credentialId: `MV-${item.id.toUpperCase()}`, credentialCategory: item.type, organizationAbbreviation, organizationName: item.organization, rank, issueDate: item.issuedOn, expiryDate: "No Expiration", keyLearning, skills: [], evidence: [], verifyUrl: `https://medalverse.ai/verify/${item.id}`, eventName, eventDescription, activityType, heldStartDate, heldEndDate, venue: "", eventField: "", participationMode: "", competitionLevel: "" } as CredentialDetail; 
}
