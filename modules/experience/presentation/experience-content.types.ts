import {
  DashboardEvent,
  EventField,
  EventLevel,
  EventType,
  TabKey,
} from "@/modules/experience/domain/dashboard.types";
import { type AppToastPayload } from "@/components/ui/AppToast";

export type ClaimDialogForm = {
  credentialCode: string;
  recipientName: string;
  credentialName: string;
  credentialCategory: string;
  organizationAbbreviation: string;
  organizationName: string;
  rank: string;
  issueDate: string;
  keyLearning: string;
  eventName: string;
  heldStartDate: string;
  heldEndDate: string;
  venue: string;
  activityType: string;
  eventField: string;
  participationMode: string;
  competitionLevel: string;
  eventDescription: string;
  visibility: "public" | "private";
  eventId: string;
};

export type ClaimToast = AppToastPayload;

export type EventsState = {
  items: DashboardEvent[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  filterOptions: {
    types: EventType[];
    fields: EventField[];
    levels: EventLevel[];
  };
};

export type ExperienceTab = { key: TabKey; label: string };
