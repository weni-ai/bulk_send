import { describe, it, expect } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MissingRecentSends from '@/components/HomeBulkSend/MissingRecentSends.vue';

const stubs = {
  NewSendButton: {
    props: ['text', 'type', 'iconLeft', 'loading'],
    template:
      '<button class="new-send-button-stub" :data-type="type">{{ text }}</button>',
  },
};

const mountWrapper = (props = {}): VueWrapper => {
  return mount(MissingRecentSends, {
    props,
    global: {
      mocks: {
        $t: () => 'stubbed text',
      },
      stubs,
    },
  });
};

describe('MissingRecentSends.vue', () => {
  it('should render the component correctly', () => {
    const wrapper = mountWrapper();

    expect(wrapper.find('.missing-recent-sends').exists()).toBe(true);
  });

  it('renders NewSendButton stub with expected props', () => {
    const wrapper = mountWrapper();
    const btn = wrapper.find('.new-send-button-stub');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes('data-type')).toBe('secondary');
  });
});
