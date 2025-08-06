import { describe, it, expect } from 'vitest'
import { formatDateWithTimezone, getDateDaysAgo, createDateRangeFromDaysAgo } from '@/utils/date'

describe('Date Utils', () => {
  describe('formatDateWithTimezone', () => {
    it('should format dates correctly in YYYY-MM-DD format', () => {
      const testDate = new Date('2024-01-15T10:30:00.000Z')
      const formattedDate = formatDateWithTimezone(testDate)
      
      expect(formattedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    })

    it('should handle timezone offset correctly', () => {
      // Test with a known date
      const testDate = new Date('2024-06-15T12:00:00.000Z')
      const formattedDate = formatDateWithTimezone(testDate)
      
      expect(formattedDate).toBe('2024-06-15')
    })
  })

  describe('getDateDaysAgo', () => {
    it('should return a date N days ago', () => {
      const today = new Date()
      const thirtyDaysAgo = getDateDaysAgo(30)
      
      const expectedDate = new Date()
      expectedDate.setDate(today.getDate() - 30)
      
      expect(thirtyDaysAgo.getDate()).toBe(expectedDate.getDate())
      expect(thirtyDaysAgo.getMonth()).toBe(expectedDate.getMonth())
      expect(thirtyDaysAgo.getFullYear()).toBe(expectedDate.getFullYear())
    })

    it('should handle zero days (today)', () => {
      const today = new Date()
      const result = getDateDaysAgo(0)
      
      expect(result.toDateString()).toBe(today.toDateString())
    })
  })

  describe('createDateRangeFromDaysAgo', () => {
    it('should create a date range from N days ago to today', () => {
      const dateRange = createDateRangeFromDaysAgo(30)
      
      expect(dateRange).toHaveProperty('start')
      expect(dateRange).toHaveProperty('end')
      expect(dateRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(dateRange.end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // End date should be today
      const today = formatDateWithTimezone(new Date())
      expect(dateRange.end).toBe(today)
      
      // Start date should be before end date
      expect(new Date(dateRange.start) < new Date(dateRange.end)).toBe(true)
    })

    it('should create correct range for 1 day', () => {
      const dateRange = createDateRangeFromDaysAgo(1)
      const yesterday = formatDateWithTimezone(getDateDaysAgo(1))
      const today = formatDateWithTimezone(new Date())
      
      expect(dateRange.start).toBe(yesterday)
      expect(dateRange.end).toBe(today)
    })
  })
})