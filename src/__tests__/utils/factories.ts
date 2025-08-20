import type { BroadcastStatistic } from '@/types/broadcast';
import { BroadcastStatus } from '@/constants/broadcasts';

export const createBroadcast = (
  overrides: Partial<BroadcastStatistic> = {},
): BroadcastStatistic => {
  const base: BroadcastStatistic = {
    id: 1,
    name: 'Test Broadcast',
    status: BroadcastStatus.SENT,
    createdBy: 'tester',
    createdOn: new Date('2024-01-01T00:00:00Z'),
    modifiedOn: new Date('2024-01-02T00:00:00Z'),
    groups: [1, 2],
    template: { name: 'Template' },
    statistics: {
      processed: 10,
      sent: 10,
      delivered: 9,
      read: 8,
      failed: 1,
      contactCount: 10,
    },
  };

  return { ...base, ...overrides };
};
