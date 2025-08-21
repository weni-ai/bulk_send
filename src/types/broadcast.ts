import { BroadcastStatus } from '@/constants/broadcasts';

interface BroadcastStatistic {
  id: number;
  name: string;
  status: BroadcastStatus;
  createdBy: string;
  createdOn: Date;
  modifiedOn: Date;
  groups: number[]; //TODO: change to group list whe API is ready
  template: {
    name: string;
  };
  statistics: Statistics;
}

interface Statistics {
  processed: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  contactCount: number;
}

interface BroadcastsMonthPerformance {
  totalSent: number;
  estimatedCost: number;
  successRate: number;
}

export type { BroadcastStatistic, Statistics, BroadcastsMonthPerformance };
