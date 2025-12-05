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

const STUBS = {
  TemplatePreviewModal: {
    props: ['modelValue', 'templateId'],
    emits: ['update:model-value'],
    template:
      '<div v-if="modelValue" data-test="template-modal"><button data-test="close" @click="$emit(\'update:model-value\', false)">close</button></div>',
  },
} as const;

const mountWrapper = (props: { send: BroadcastStatistic }) =>
  mount(SendElementInfo, {
    props,
    global: {
      stubs: STUBS,
      mocks: { $t: () => 'stubbed text' },
    },
  });

const mockSendSent: BroadcastStatistic = createBroadcast({
  createdBy: 'Alice',
  // date with timezone UTC-3 included
  createdOn: new Date('2024-01-01T09:00:00.000-03:00'),
  modifiedOn: new Date('2024-01-01T10:00:00.000-03:00'),
  template: { id: 1, name: 'Template A' },
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
    expect(wrapper.text()).toContain('Group 1, Group 2');
    expect(wrapper.text()).toContain('Alice');
  });

  it('shows "-" for endedOn when not SENT', () => {
    const wrapper = mountWrapper({ send: mockSendQueued });
    expect(wrapper.text()).toContain('-');
  });

  it('opens and closes TemplatePreviewModal when view template is clicked', async () => {
    const wrapper = mountWrapper({ send: mockSendSent });
    expect(wrapper.find('[data-test="template-modal"]').exists()).toBe(false);

    await wrapper.find(SELECTOR.viewTemplate).trigger('click');
    expect(wrapper.find('[data-test="template-modal"]').exists()).toBe(true);

    await wrapper.find('[data-test="close"]').trigger('click');
    expect(wrapper.find('[data-test="template-modal"]').exists()).toBe(false);
  });

  it('hides view template button when send has no template', () => {
    const wrapper = mountWrapper({
      send: {
        ...mockSendSent,
        template: undefined as any,
      },
    });
    expect(wrapper.find(SELECTOR.viewTemplate).exists()).toBe(false);
  });
});
