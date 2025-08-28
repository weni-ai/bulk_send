import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SendElementInfo from '@/components/HomeBulkSend/SendElementInfo.vue';
import type { BroadcastStatistic } from '@/types/broadcast';
import { BroadcastStatus } from '@/constants/broadcasts';
import { createBroadcast } from '@/__tests__/utils/factories';

const SELECTOR = {
  root: '[data-test="send-element-info"]',
  viewTemplate: '[data-test="view-template"]',
} as const;

const mountWrapper = (props: { send: BroadcastStatistic }) =>
  mount(SendElementInfo, {
    props,
    global: {
      mocks: { $t: () => 'stubbed text' },
    },
  });

const mockSendSent: BroadcastStatistic = createBroadcast({
  createdBy: 'Alice',
  createdOn: new Date('2024-01-01T09:00:00.000Z'),
  modifiedOn: new Date('2024-01-01T10:00:00.000Z'),
  template: { name: 'Template A' },
});

const mockSendQueued: BroadcastStatistic = createBroadcast({
  status: BroadcastStatus.QUEUED,
});

describe('SendElementInfo.vue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dates, template, groups, creator for SENT status', () => {
    const wrapper = mountWrapper({ send: mockSendSent });
    expect(wrapper.find(SELECTOR.root).exists()).toBe(true);
    expect(wrapper.text()).toContain('Jan 1, 9:00 AM');
    expect(wrapper.text()).toContain('Jan 1, 10:00 AM');
    expect(wrapper.text()).toContain('Template A');
    expect(wrapper.text()).toContain('1, 2');
    expect(wrapper.text()).toContain('Alice');
  });

  it('shows "-" for endedOn when not SENT', () => {
    const wrapper = mountWrapper({ send: mockSendQueued });
    expect(wrapper.text()).toContain('-');
  });

  it('emits view template action via console.log', () => {
    const wrapper = mountWrapper({ send: mockSendSent });
    const consoleSpy = vi.spyOn(console, 'log');
    wrapper.find(SELECTOR.viewTemplate).trigger('click');
    expect(consoleSpy).toHaveBeenCalledWith('view template');
  });
});
