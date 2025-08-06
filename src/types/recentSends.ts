/**
 * Types for recent sends functionality
 */

export interface RecentSend {
  id: number
  name: string
  status: string
  createdAt: Date
}

export interface DateRange {
  start: string
  end: string
}