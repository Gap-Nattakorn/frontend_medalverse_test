export type CredentialCategory = "events" | "portfolio";
export type CredentialVisibility = "public" | "private";

export type CredentialItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  issuedOn: string;
  organization: string;
  isVerified: boolean;
  category: CredentialCategory;
  issuerLogo: string;
  coverImage: string;
};

export type CredentialDetail = {
  credential: CredentialItem;
  recipientName: string;
  credentialId: string;
  credentialCategory: string;
  organizationAbbreviation: string;
  organizationName: string;
  rank: string;
  issueDate: string;
  expiryDate: string;
  keyLearning: string;
  skills: string[];
  evidence: string[];
  verifyUrl: string;

  eventName?: string;
  heldStartDate?: string;
  heldEndDate?: string;
  activityType?: string;
  eventField?: string;
  venue?: string;
  participationMode?: string;
  competitionLevel?: string;
  eventDescription?: string;
};

export type CredentialsListResponse = {
  success: true;
  data: {
    items: CredentialItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CredentialDetailResponse = {
  success: true;
  data: CredentialDetail;
};
