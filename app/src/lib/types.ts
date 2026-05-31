export type Classification = "hot" | "warm" | "cold" | "unclassified";

export type FieldKey =
  | "name"
  | "destination"
  | "travel_dates"
  | "group_size"
  | "budget";

export type ExtractedField = {
  // The five built-in fields use a FieldKey; custom campaign criteria use a
  // generated string key, so this is widened to string.
  key: string;
  label: string;
  value: string | null;
  confidence: number | null;
  extractedAtMessageIndex: number | null;
};

export type MessageType = "text" | "voice" | "image";

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  type: MessageType;
  highlights?: FieldKey[];
};

export type LeadStatus = "in_progress" | "complete" | "abandoned";

export type LeadSource = "meta_ad" | "referral" | "organic";

export type LeadLanguage = "en" | "hi" | "hinglish";

export type ClassificationSource = "model" | "user";

export type BookingStatus = "enquiry" | "booked" | "travelled";

export type Admin = {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  active: boolean;
};

export type Lead = {
  id: string;
  contactName: string | null;
  phoneMasked: string;
  language: LeadLanguage;
  source: LeadSource;
  status: LeadStatus;
  classification: Classification;
  classificationSource: ClassificationSource;
  classificationReason?: string;
  assignedToId: string | null;
  campaignId: string | null;
  bookingStatus: BookingStatus;
  extractedFields: ExtractedField[];
  messages: Message[];
  startedAt: string;
  lastActivityAt: string;
  agentNotifiedAt?: string;
  pendingMessages?: Message[];
  pendingExtractions?: ExtractedField[];
  pendingClassification?: Classification;
};

export const FIELD_LABELS: Record<FieldKey, string> = {
  name: "Name",
  destination: "Destination",
  travel_dates: "Travel dates",
  group_size: "Group size",
  budget: "Budget",
};

export function emptyFields(): ExtractedField[] {
  return (Object.keys(FIELD_LABELS) as FieldKey[]).map((key) => ({
    key,
    label: FIELD_LABELS[key],
    value: null,
    confidence: null,
    extractedAtMessageIndex: null,
  }));
}

// ── Campaign qualifying criteria ───────────────────────────────────────────

/**
 * One thing the intake agent qualifies a lead against. The five defaults map
 * to the built-in FieldKeys; admins can add custom criteria per campaign.
 */
export type QualifyingCriterion = {
  key: string;
  label: string;
  custom: boolean;
};

export type CampaignStatus = "draft" | "live" | "closed";

export type ItineraryDay = { day: number; title: string; detail: string };

export type Campaign = {
  id: string;
  name: string;
  criteria: QualifyingCriterion[];
  status: CampaignStatus;
  destination: string;
  matchKeywords: string[];
  startDate: string | null;
  endDate: string | null;
  pricePerPerson: number | null;
  seatsTotal: number | null;
  seatsBooked: number;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  leaderId: string | null;
};

/** A blank campaign with sensible defaults. Pure; callers override `id`. */
export function emptyCampaign(name: string): Campaign {
  return {
    id: "",
    name,
    criteria: [...DEFAULT_CRITERIA],
    status: "draft",
    destination: "",
    matchKeywords: [],
    startDate: null,
    endDate: null,
    pricePerPerson: null,
    seatsTotal: null,
    seatsBooked: 0,
    itinerary: [],
    inclusions: [],
    exclusions: [],
    leaderId: null,
  };
}

/** The five built-in criteria every campaign starts with. */
export const DEFAULT_CRITERIA: QualifyingCriterion[] = (
  Object.keys(FIELD_LABELS) as FieldKey[]
).map((key) => ({ key, label: FIELD_LABELS[key], custom: false }));

/** Empty extraction fields for an arbitrary set of campaign criteria. */
export function fieldsFromCriteria(criteria: QualifyingCriterion[]): ExtractedField[] {
  return criteria.map((c) => ({
    key: c.key,
    label: c.label,
    value: null,
    confidence: null,
    extractedAtMessageIndex: null,
  }));
}

export function makeCriterionKey(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `c_${slug || "field"}_${Math.random().toString(36).slice(2, 6)}`;
}
