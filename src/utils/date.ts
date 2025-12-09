/**
 * Date utility functions
 */

import { addMinutes, format } from 'date-fns';

/**
 * Extracts the timezone offset in minutes from an ISO date string.
 * @param dateString - ISO date string (e.g., '2024-01-01T09:00:00.000-03:00')
 * @returns Offset in minutes (e.g., -180 for -03:00) or null if not found
 */
const extractTimezoneOffset = (dateString: string): number | null => {
  // Match timezone offset like +05:30, -03:00, or Z (UTC)
  const offsetMatch = dateString.match(/([+-])(\d{2}):(\d{2})$|Z$/);

  if (!offsetMatch) return null;

  // Z means UTC (offset 0)
  if (offsetMatch[0] === 'Z') return 0;

  const sign = offsetMatch[1] === '+' ? 1 : -1;
  const hours = parseInt(offsetMatch[2], 10);
  const minutes = parseInt(offsetMatch[3], 10);

  return sign * (hours * 60 + minutes);
};

/**
 * Formats an ISO date string preserving the original timezone.
 * This ensures dates are displayed as they were originally recorded,
 * regardless of the user's browser timezone.
 * @param dateString - ISO date string with timezone (e.g., '2024-01-01T09:00:00.000-03:00')
 * @param formatStr - The format string (e.g. 'dd/MM/yyyy', 'MMM d, h:mm aa')
 * @returns Formatted date string in the original timezone
 */
export const formatDatePreservingTimezone = (
  dateString: string,
  formatStr: string,
): string => {
  const date = new Date(dateString);
  const originalOffset = extractTimezoneOffset(dateString);

  if (originalOffset === null) {
    // No timezone info found, format as-is (browser timezone)
    return format(date, formatStr);
  }

  // The Date object stores UTC time. To display in the original timezone,
  // we adjust by adding the original offset and subtracting the local offset.
  // This "tricks" format() into showing the correct wall-clock time.
  const localOffset = -date.getTimezoneOffset(); // getTimezoneOffset returns inverted sign
  const adjustedDate = new Date(
    date.getTime() + (originalOffset - localOffset) * 60 * 1000,
  );

  return format(adjustedDate, formatStr);
};

/**
 * Gets a date N days ago from today
 * @param daysAgo - Number of days to subtract from today
 * @returns Date object representing the date N days ago
 */
export const getDateDaysAgo = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

/**
 * Creates a date range from N days ago to today
 * @param daysAgo - Number of days to go back from today
 * @returns Object with start and end date strings in yyyy-MM-dd format
 */
export const createDateRangeFromDaysAgo = (daysAgo: number) => ({
  start: format(getDateDaysAgo(daysAgo), 'yyyy-MM-dd'),
  end: format(new Date(), 'yyyy-MM-dd'),
});

export const getDateInUTC = (date: Date) => {
  return addMinutes(date, date.getTimezoneOffset());
};
