import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SendElement from '@/components/HomeBulkSend/SendElement.vue';
import type { BroadcastStatistic } from '@/types/broadcast';
import { BroadcastStatus } from '@/constants/broadcasts';
import { createBroadcast } from '@/__tests__/utils/factories';
import { nextTick } from 'vue';
import { toPercentage } from '@/utils/number';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const stubs = {
  UnnnicCollapse: {
    template:
      '<div class="unnnic-collapse-stub"><slot name="header" /><slot /></div>',
  },
  UnnnicTag: {
    props: ['text'],
    template:
      '<div data-test="tag" class="unnnic-tag-stub" :class="$attrs.class" :data-scheme="($attrs.class || \'\').includes(\'aux-green\') ? \'aux-green\' : \'aux-orange\'">{{ text }}</div>',
  },
  MetricsTable: {
    name: 'MetricsTable',
    props: ['data', 'maxColumns'],
    template:
      '<div data-test="metrics">Metrics: {{ data?.length }}<button data-test="metrics-action-failed" @click="(data && (data.find(m => m.actions) && data.find(m => m.actions).actions[0] && data.find(m => m.actions).actions[0].onClick()))">open clicked modal</button></div>',
  },
  SendElementInfo: {
    template: '<div class="send-element-info-stub" />',
  },
  NewContactGroupModal: {
    name: 'NewContactGroupModal',
    props: ['modelValue', 'contactCount', 'category', 'broadcastName'],
    template:
      '<div data-test="new-contact-group-modal" class="new-contact-group-modal-stub"></div>',
  },
};

const SELECTOR = {
  title: '[data-test="title"]',
  date: '[data-test="date"]',
  tag: '[data-test="tag"]',
  metrics: '[data-test="metrics"]',
  metricsActionFailed: '[data-test="metrics-action-failed"]',
  modal: '[data-test="new-contact-group-modal"]',
} as const;

const getMetricsData = (wrapper: any) =>
  (wrapper.findComponent({ name: 'MetricsTable' }).props('data') as any[]) ||
  [];

const clickMetricAction = (wrapper: any, metricKey: string) => {
  const data = getMetricsData(wrapper);
  const row = data.find((m) =>
    String(m.label).includes(`home.recent_sends.metrics.${metricKey}.label`),
  );
  row?.actions?.[0]?.onClick?.();
};

const mountWrapper = (overrides: Partial<BroadcastStatistic> = {}) => {
  const send: BroadcastStatistic = createBroadcast({
    name: 'Test Send',
    status: BroadcastStatus.SENT,
    createdOn: '2024-01-01T12:00:00.000Z',
    modifiedOn: '2024-01-01T13:00:00.000Z',
    ...overrides,
  });

  return mount(SendElement, {
    props: { send },
    global: {
      stubs,
    },
  });
};

describe('SendElement.vue', () => {
  it('renders header with title, date and tag text', () => {
    const wrapper = mountWrapper();
    expect(wrapper.find(SELECTOR.title).text()).toBe('Test Send');
    expect(wrapper.find(SELECTOR.date).text()).toBe('01/01/2024');
    expect(wrapper.find(SELECTOR.tag).text()).toBe(
      'home.recent_sends.status.SENT',
    );
  });

  it('applies green tag scheme when status is SENT', () => {
    const wrapper = mountWrapper({ status: BroadcastStatus.SENT });
    expect(wrapper.find(SELECTOR.tag).attributes('data-scheme')).toBe(
      'aux-green',
    );
  });

  it('applies orange tag scheme when status is not SENT', () => {
    const wrapper = mountWrapper({ status: BroadcastStatus.QUEUED });
    expect(wrapper.find(SELECTOR.tag).attributes('data-scheme')).toBe(
      'aux-orange',
    );
  });

  it('passes key metric values to MetricsTable', () => {
    const wrapper = mountWrapper();
    const data = wrapper
      .findComponent({ name: 'MetricsTable' })
      .props('data') as Array<any>;

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(6);

    const byLabel = Object.fromEntries(
      data.map((m: any) => [m.label as string, m]),
    );

    // Processed displays translation key when > 0
    expect(byLabel['home.recent_sends.metrics.processed.label'].value).toBe(
      'home.recent_sends.metrics.processed.value',
    );

    // Delivered percentage and subValue
    const deliveredPercentage = toPercentage(90);
    expect(byLabel['home.recent_sends.metrics.delivered.label'].value).toBe(
      deliveredPercentage,
    );
    expect(byLabel['home.recent_sends.metrics.delivered.label'].subValue).toBe(
      '9',
    );

    // Failed percentage
    const failedPercentage = toPercentage(10);
    expect(byLabel['home.recent_sends.metrics.failed.label'].value).toBe(
      failedPercentage,
    );
    expect(byLabel['home.recent_sends.metrics.failed.label'].subValue).toBe(
      '1',
    );
  });

  it('opens NewContactGroup modal when failed metric action is triggered', async () => {
    const wrapper = mountWrapper();

    // Invoke the failed metric action via helper
    clickMetricAction(wrapper, 'failed');
    await nextTick();

    expect(wrapper.find(SELECTOR.modal).exists()).toBe(true);

    const modalComp = wrapper.findComponent({ name: 'NewContactGroupModal' });
    expect(modalComp.props('modelValue')).toBe(true);
    expect(modalComp.props('contactCount')).toBe(
      (wrapper.props('send') as BroadcastStatistic).statistics.failed,
    );
    expect(modalComp.props('category')).toBe('failed');
    expect(modalComp.props('broadcastName')).toBe('Test Send');
  });
});
