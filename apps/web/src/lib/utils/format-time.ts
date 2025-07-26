import { formatDistanceToNow } from "date-fns";

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * Falls back to absolute date for dates older than 7 days
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return "—";
    }

    // Check if date is within last 7 days
    const now = new Date();
    const diffInDays =
      (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays < 7) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }

    // For older dates, use absolute format
    return dateObj.toLocaleDateString();
  } catch {
    return "—";
  }
}
