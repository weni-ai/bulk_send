import type { BroadcastStatistic } from '@/types/broadcast';
import { BroadcastStatus } from '@/constants/broadcasts';
import type { Group } from '@/types/groups';

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
    groups: [
      { uuid: 'uuid-1', name: 'Group 1' },
      { uuid: 'uuid-2', name: 'Group 2' },
    ],
    template: { id: 1, name: 'Template' },
    statistics: {
      processed: 10,
      sent: 10,
      delivered: 9,
      read: 8,
      failed: 1,
      contactCount: 10,
      cost: 2,
      currency: 'USD',
      template_price: 0.2,
    },
  };

  return { ...base, ...overrides };
};

export const createGroup = (overrides: Partial<Group> = {}): Group => ({
  id: overrides.id ?? 1,
  uuid: overrides.uuid ?? 'uuid-1',
  name: overrides.name ?? 'Group 1',
  memberCount: overrides.memberCount ?? 10,
});
