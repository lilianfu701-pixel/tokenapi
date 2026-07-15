export const REVIEW_STATUSES = ["new", "contacted", "approved", "rejected"] as const;
export const MAX_ADMIN_NOTES_LENGTH = 2500;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function validateReviewStatus(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string") {
    return null;
  }

  return REVIEW_STATUSES.includes(value as ReviewStatus) ? (value as ReviewStatus) : null;
}

export function normalizeAdminNotes(value: FormDataEntryValue | string | null) {
  const notes = typeof value === "string" ? value.trim() : "";

  if (notes.length > MAX_ADMIN_NOTES_LENGTH) {
    return null;
  }

  return notes;
}
