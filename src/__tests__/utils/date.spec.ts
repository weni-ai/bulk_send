import { describe, it, expect } from 'vitest';
import { format } from 'date-fns';
import {
  formatDatePreservingTimezone,
  getDateDaysAgo,
  createDateRangeFromDaysAgo,
} from '@/utils/date';

describe('Date Utils', () => {
  describe('formatDatePreservingTimezone', () => {
    it('should preserve the original timezone from ISO string (-03:00)', () => {
      // Date at 21:00 in -03:00 timezone
      const dateString = '2024-01-01T21:00:00.000-03:00';
      const formatted = formatDatePreservingTimezone(
        dateString,
        'yyyy-MM-dd HH:mm',
      );

      // Should display as 21:00, not converted to browser timezone
      expect(formatted).toBe('2024-01-01 21:00');
    });

    it('should preserve different timezone offsets (+05:30)', () => {
      // Date at 14:30 in +05:30 timezone (India)
      const dateString = '2024-06-15T14:30:00.000+05:30';
      const formatted = formatDatePreservingTimezone(
        dateString,
        'yyyy-MM-dd HH:mm',
      );

      expect(formatted).toBe('2024-06-15 14:30');
    });

    it('should handle UTC dates (Z suffix)', () => {
      const dateString = '2024-03-20T12:00:00.000Z';
      const formatted = formatDatePreservingTimezone(
        dateString,
        'yyyy-MM-dd HH:mm',
      );

      expect(formatted).toBe('2024-03-20 12:00');
    });

    it('should format with different format strings', () => {
      const dateString = '2024-01-01T09:00:00.000-03:00';
      const formatted = formatDatePreservingTimezone(
        dateString,
        'MMM d, h:mm aa',
      );

      expect(formatted).toBe('Jan 1, 9:00 AM');
    });
  });

  describe('getDateDaysAgo', () => {
    it('should return a date N days ago', () => {
      const today = new Date();
      const thirtyDaysAgo = getDateDaysAgo(30);

      const expectedDate = new Date();
      expectedDate.setDate(today.getDate() - 30);

      expect(thirtyDaysAgo.getDate()).toBe(expectedDate.getDate());
      expect(thirtyDaysAgo.getMonth()).toBe(expectedDate.getMonth());
      expect(thirtyDaysAgo.getFullYear()).toBe(expectedDate.getFullYear());
    });

    it('should handle zero days (today)', () => {
      const today = new Date();
      const result = getDateDaysAgo(0);

      expect(result.toDateString()).toBe(today.toDateString());
    });
  });

  describe('createDateRangeFromDaysAgo', () => {
    it('should create a date range from N days ago to today', () => {
      const dateRange = createDateRangeFromDaysAgo(30);

      expect(dateRange).toHaveProperty('start');
      expect(dateRange).toHaveProperty('end');
      expect(dateRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dateRange.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // End date should be today
      const today = format(new Date(), 'yyyy-MM-dd');
      expect(dateRange.end).toBe(today);

      // Start date should be before end date
      expect(new Date(dateRange.start) < new Date(dateRange.end)).toBe(true);
    });

    it('should create correct range for 1 day', () => {
      const dateRange = createDateRangeFromDaysAgo(1);
      const yesterday = format(getDateDaysAgo(1), 'yyyy-MM-dd');
      const today = format(new Date(), 'yyyy-MM-dd');

      expect(dateRange.start).toBe(yesterday);
      expect(dateRange.end).toBe(today);
    });
  });
});
