import type { Group, GroupReference } from '@/types/groups';
import type { Template } from '@/types/template';
import type { PageRequestParams } from '@/types/requests';
import { BroadcastStatus, NewBroadcastPage } from '@/constants/broadcasts';
import { Currency } from '@/constants/currency';

interface BroadcastStatisticsParams extends PageRequestParams {
  start_date?: string;
  end_date?: string;
  name?: string;
}

interface BroadcastStatistic {
  id: number;
  name: string;
  status: BroadcastStatus;
  createdBy: string;
  createdOn: Date;
  modifiedOn: Date;
  groups: GroupReference[];
  template: Template;
  statistics: Statistics;
}

interface CoreStatistics {
  processed: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

interface Statistics extends CoreStatistics {
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

interface NewBroadcastState {
  currentPage: NewBroadcastPage;
  selectedGroups: Group[];
}

export type {
  BroadcastStatistic,
  CoreStatistics,
  Statistics,
  BroadcastsMonthPerformance,
  BroadcastStatisticsParams,
  NewBroadcastState,
};
