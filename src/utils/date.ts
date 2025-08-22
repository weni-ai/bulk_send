/**
 * Date utility functions
 */

import { addMinutes, format } from 'date-fns';

/**
 * Formats a date to desired format considering timezone offset
 * @param date - The date to format
 * @param formatStr  - The format to use for formatting (e.g. 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd')
 * @returns Formatted date string in desired format
 */
export const formatDateWithTimezone = (
  date: Date,
  formatStr: string,
): string => {
  // TODO: check if this will work properly with API dates
  const offset = date.getTimezoneOffset();
  const tzDate = new Date(date.getTime() + offset * 60 * 1000);
  return format(tzDate, formatStr);
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
  start: formatDateWithTimezone(getDateDaysAgo(daysAgo), 'yyyy-MM-dd'),
  end: formatDateWithTimezone(new Date(), 'yyyy-MM-dd'),
});

export const getDateInUTC = (date: Date) => {
  return addMinutes(date, date.getTimezoneOffset());
};
