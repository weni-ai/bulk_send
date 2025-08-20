import type { Group } from '@/types/groups';
import type { Template } from '@/types/template';
import { BroadcastStatus } from '@/constants/broadcasts';
import { Currency } from '@/constants/currency';

interface BroadcastStatistic {
  id: number;
  name: string;
  status: BroadcastStatus;
  createdBy: string;
  createdOn: Date;
  modifiedOn: Date;
  groups: Group[];
  template: Template;
  statistics: Statistics;
}

interface Statistics {
  processed: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  contactCount: number;
  cost: number;
  currency: keyof typeof Currency;
  template_price: number;
}

interface BroadcastsMonthPerformance {
  totalSent: number;
  estimatedCost: number;
  successRate: number;
}

export type { BroadcastStatistic, Statistics, BroadcastsMonthPerformance };
