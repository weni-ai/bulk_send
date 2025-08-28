import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NewBroadcastHeader from '@/components/NewBroadcast/NewBroadcastHeader.vue';

const SELECTOR = {
  back: '[data-test="back"]',
  navigator: '[data-test="navigator"]',
} as const;

const mockRouterBack = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ back: mockRouterBack }),
}));

const stubs = {
  UnnnicButton: {
    props: ['type', 'iconLeft'],
    template:
      '<button data-test="back" @click="$emit(\'click\')"><slot /></button>',
  },
  NewBroadcastNavigator: {
    template: '<div data-test="navigator" />',
  },
};

const mountWrapper = () =>
  mount(NewBroadcastHeader, {
    global: {
      stubs,
      mocks: { $t: (key: string) => key },
    },
  });

describe('NewBroadcastHeader.vue', () => {
  it('renders title and navigator', () => {
    const wrapper = mountWrapper();
    expect(wrapper.text()).toContain('new_broadcast.title');
    expect(wrapper.find(SELECTOR.navigator).exists()).toBe(true);
  });

  it('invokes router.back when back button is clicked', async () => {
    mockRouterBack.mockClear();
    const wrapper = mountWrapper();
    await wrapper.find(SELECTOR.back).trigger('click');
    expect(mockRouterBack).toHaveBeenCalled();
  });
});
