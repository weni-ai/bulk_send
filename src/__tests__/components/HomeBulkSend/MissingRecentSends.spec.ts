import { describe, it, expect } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MissingRecentSends from '@/components/HomeBulkSend/MissingRecentSends.vue';

const stubs = {
  UnnnicButton: {
    props: ['text', 'type'],
    emits: ['click'],
    template: '<button class="unnnic-button-stub" :data-type="type" @click="$emit(\'click\')">{{ text }}</button>'
  }
};

const mountWrapper = (props = {}): VueWrapper => {
  return mount(MissingRecentSends, {
    props,
    global: {
      mocks: {
        $t: () => 'stubbed text'
      },
      stubs
    }
  });
};

describe('MissingRecentSends.vue', () => {
  it('should render the component correctly', () => {
    const wrapper = mountWrapper();
    
    expect(wrapper.find('.missing-recent-sends').exists()).toBe(true);
  });

  it('should emit "start-new-send" event when button is clicked', async () => {
    const wrapper = mountWrapper();
    
    const button = wrapper.find('.unnnic-button-stub');
    await button.trigger('click');
    
    expect(wrapper.emitted('start-new-send')).toBeTruthy();
    expect(wrapper.emitted('start-new-send')).toHaveLength(1);
  });
});