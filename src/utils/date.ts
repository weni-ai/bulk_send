/**
 * Date utility functions
 */

import { addMinutes, format } from 'date-fns';

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
