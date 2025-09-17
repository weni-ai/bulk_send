import type { Group, GroupReference } from '@/types/groups';
import type { Template, TemplateReference } from '@/types/template';
import type { PageRequestParams } from '@/types/requests';
import { BroadcastStatus, NewBroadcastPage } from '@/constants/broadcasts';
import { Currency } from '@/constants/currency';
import type { ContactField } from './contacts';
import type { FlowReference } from './flow';

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
  template: TemplateReference;
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
  estimatedCost: string;
  successRate: number;
}

interface NewBroadcastState {
  currentPage: NewBroadcastPage;
  groupSelectionOpen: boolean;
  contactImportOpen: boolean;
  selectedGroups: Group[];
  selectedTemplate?: Template;
  variableMapping: Record<number, ContactField | undefined>;
  broadcastName: string;
  selectedFlow?: FlowReference;
  reviewed: boolean;
}

interface CreateBroadcastData {
  queue: 'template_batch';
  project: string;
  name: string;
  groups: string[];
  msg: {
    template: {
      uuid: string;
      variables: string[];
    };
  };
}

export type {
  BroadcastStatistic,
  CoreStatistics,
  Statistics,
  BroadcastsMonthPerformance,
  BroadcastStatisticsParams,
  NewBroadcastState,
  CreateBroadcastData,
};
