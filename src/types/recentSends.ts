/**
 * Types for recent sends functionality
 */

interface RecentSend {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  endedAt: Date; // TODO: check how this will be calculated
  template: {
    name: string;
  };
  groups: string[];
  createdBy: string;
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
    estimatedCost: string;
  };
}

interface DateRange {
  start: string;
  end: string;
}

export type { RecentSend, DateRange };
