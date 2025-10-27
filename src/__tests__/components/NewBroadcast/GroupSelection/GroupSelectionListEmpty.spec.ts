import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GroupSelectionListEmpty from '@/components/NewBroadcast/GroupSelection/GroupSelectionListEmpty.vue';

const SELECTOR = {
  root: '[data-test="empty"]',
  text: '[data-test="empty-text"]',
} as const;

const stubs = {
  UnnnicButton: {
    props: ['type', 'disabled'],
    template: '<button data-test="unnnic-button"><slot /></button>',
  },
} as const;

describe('GroupSelectionListEmpty.vue', () => {
  it('renders empty state text', () => {
    const wrapper = mount(GroupSelectionListEmpty, {
      global: {
        stubs,
        mocks: { $t: (key: string) => key },
      },
    });
    expect(wrapper.find(SELECTOR.root).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.text).text()).toBe(
      'new_broadcast.pages.select_groups.no_groups',
    );
  });
});
