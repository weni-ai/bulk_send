import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GroupSelectionOverview from '@/components/NewBroadcast/GroupSelection/GroupSelectionOverview.vue';
import type { Group } from '@/types/groups';
import { createGroup } from '@/__tests__/utils/factories';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key.endsWith('overview.title')) return `Selected: ${params?.count}`;
      if (key.endsWith('overview.total_label')) return 'Total';
      if (key.endsWith('overview.total_value')) return `${params?.total}`;
      if (key.endsWith('overview.cost_label')) return 'Cost';
      if (key.endsWith('overview.cost_value')) {
        return `${params?.currency}${params?.cost} (x${params?.templateMultiplier})`;
      }
      return key;
    },
  }),
}));

const SELECTOR = {
  overview: '[data-test="overview"]',
  title: '[data-test="overview-title"]',
  totalLabel: '[data-test="total-label"]',
  totalValue: '[data-test="total-value"]',
  costLabel: '[data-test="cost-label"]',
  costValue: '[data-test="cost-value"]',
  remove: '[data-test="overview-remove"]',
} as const;

const stubs = {
  UnnnicToolTip: { template: '<div><slot /></div>' },
  UnnnicIcon: { template: '<i />' },
};

const mountWrapper = (selectedGroups: Group[]) =>
  mount(GroupSelectionOverview, {
    props: { selectedGroups },
    global: { stubs },
  });

describe('GroupSelectionOverview.vue', () => {
  it('shows count, total members and cost summary', () => {
    const groups = [
      createGroup({ id: 1, memberCount: 10 }),
      createGroup({ id: 2, uuid: 'uuid-2', name: 'Group 2', memberCount: 5 }),
    ];
    const wrapper = mountWrapper(groups);

    // Title shows selected groups count
    expect(wrapper.find(SELECTOR.title).text()).toContain('Selected: 2');

    // Labels exist
    expect(wrapper.find(SELECTOR.totalLabel).text()).toBe('Total');
    expect(wrapper.find(SELECTOR.costLabel).text()).toBe('Cost');

    // Total value equals sum of memberCount
    expect(wrapper.find(SELECTOR.totalValue).text()).toBe('15');

    // Cost uses USD symbol and 0.12 multiplier from component (formatted)
    // cost = 15 * 0.12 = 1.80
    const cost = 1.8;
    const costLocalized = cost.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    });
    expect(wrapper.find(SELECTOR.costValue).text()).toContain(
      `$${costLocalized} (x0.12)`,
    );
  });

  it('renders zero state when no groups selected', () => {
    const wrapper = mountWrapper([]);
    expect(wrapper.find(SELECTOR.title).text()).toContain('Selected: 0');
    expect(wrapper.find(SELECTOR.totalValue).text()).toBe('0');

    const cost = 0;
    const costLocalized = cost.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    });
    expect(wrapper.find(SELECTOR.costValue).text()).toContain(
      `$${costLocalized} (x0.12)`,
    );
  });

  it('emits remove when clicking the removal control', async () => {
    const wrapper = mountWrapper([createGroup({ id: 1, memberCount: 1 })]);
    await wrapper.find(SELECTOR.remove).trigger('click');
    expect(wrapper.emitted('remove')).toBeTruthy();
  });
});
