/**
 * Date utility functions
 */

/**
 * Formats a date to YYYY-MM-DD format considering timezone offset
 * @param date - The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateWithTimezone = (date: Date): string => {
  const offset = date.getTimezoneOffset()
  const tzDate = new Date(date.getTime() - (offset * 60 * 1000))
  return tzDate.toISOString().split('T')[0]
}

/**
 * Gets a date N days ago from today
 * @param daysAgo - Number of days to subtract from today
 * @returns Date object representing the date N days ago
 */
export const getDateDaysAgo = (daysAgo: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

/**
 * Creates a date range from N days ago to today
 * @param daysAgo - Number of days to go back from today
 * @returns Object with start and end date strings in YYYY-MM-DD format
 */
export const createDateRangeFromDaysAgo = (daysAgo: number) => ({
  start: formatDateWithTimezone(getDateDaysAgo(daysAgo)),
  end: formatDateWithTimezone(new Date()),
})