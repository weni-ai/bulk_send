import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecentSendsList from '@/components/HomeBulkSend/RecentSendsList.vue';
import type { BroadcastStatistic } from '@/types/broadcast';
import { createBroadcast } from '@/__tests__/utils/factories';

const PAGE_SIZE = 5;

const buildRecentSends = (count: number): BroadcastStatistic[] => {
  const sends: BroadcastStatistic[] = [];
  for (let i = 1; i <= count; i += 1) {
    sends.push(createBroadcast({ id: i, name: `Send ${i}` }));
  }
  return sends;
};

const SELECTOR = {
  sendElement: '[data-test="send-element"]',
  pagination: '[data-test="pagination"]',
  skeleton: '[data-test="skeleton"]',
} as const;

const stubs = {
  SendElement: {
    props: ['send'],
    template: '<div data-test="send-element">Send {{ send.id }}</div>',
  },
  UnnnicPagination: {
    props: ['max', 'modelValue'],
    emits: ['update:model-value'],
    template:
      '<div data-test="pagination" :data-max="max" :data-page="modelValue" @click="$emit(\'update:model-value\', (modelValue || 1) + 1)">Pagination</div>',
  },
  UnnnicSkeletonLoading: {
    props: ['width', 'height'],
    template: '<div data-test="skeleton" />',
  },
};

const mountWrapper = (options?: {
  recentSends?: BroadcastStatistic[];
  loading?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
}) => {
  const props = {
    loading: options?.loading ?? false,
    recentSends: options?.recentSends ?? buildRecentSends(PAGE_SIZE),
    page: options?.page ?? 1,
    pageSize: options?.pageSize ?? PAGE_SIZE,
    total: options?.total ?? options?.recentSends?.length ?? PAGE_SIZE,
  };
  return mount(RecentSendsList, {
    props,
    global: {
      stubs,
      mocks: { $t: (key: string) => key },
    },
  });
};

describe('RecentSendsList.vue', () => {
  it('renders sends when not loading', () => {
    const wrapper = mountWrapper({ recentSends: buildRecentSends(3) });
    const items = wrapper.findAll(SELECTOR.sendElement);
    expect(items).toHaveLength(3);
    expect(wrapper.text()).toContain('Send 1');
    expect(wrapper.text()).toContain('Send 3');
  });

  it('renders skeletons equal to pageSize when loading', () => {
    const wrapper = mountWrapper({ loading: true, pageSize: 4 });
    expect(wrapper.findAll(SELECTOR.skeleton)).toHaveLength(4);
    expect(wrapper.findAll(SELECTOR.sendElement)).toHaveLength(0);
  });

  it('sets pagination max pages based on total and pageSize', () => {
    const wrapper = mountWrapper({
      recentSends: buildRecentSends(4),
      total: 12,
    });
    const maxAttr = wrapper.find(SELECTOR.pagination).attributes('data-max');
    expect(Number(maxAttr)).toBe(3);
    const pageAttr = wrapper.find(SELECTOR.pagination).attributes('data-page');
    expect(Number(pageAttr)).toBe(1);
  });

  it('emits update:page when pagination component changes page', async () => {
    const wrapper = mountWrapper({});
    const pagination = wrapper.find(SELECTOR.pagination);
    await pagination.trigger('click');
    expect(wrapper.emitted('update:page')).toEqual([[2]]);
  });
});
