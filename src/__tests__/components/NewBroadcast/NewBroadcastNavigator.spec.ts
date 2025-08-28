import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';
import NewBroadcastNavigator from '@/components/NewBroadcast/NewBroadcastNavigator.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const SELECTOR = {
  navigator: '[data-test="navigator"]',
} as const;

const stubs = {
  UnnnicNavigator: {
    props: ['pages', 'activePage'],
    template:
      '<div data-test="navigator" :data-pages="pages.join(\'|\')" :data-active="activePage" />',
  },
};

const mountWithStore = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const wrapper = mount(NewBroadcastNavigator, {
    global: { plugins: [pinia], stubs },
  });
  return { wrapper, broadcastsStore };
};

describe('NewBroadcastNavigator.vue', () => {
  it('sets pages based on enum values and active page from store', async () => {
    const { wrapper, broadcastsStore } = mountWithStore();

    const expectedPages = Object.values(NewBroadcastPage)
      .map((p) => `new_broadcast.pages.${p}.title`)
      .join('|');

    const nav = wrapper.find(SELECTOR.navigator);
    expect(nav.attributes('data-pages')).toBe(expectedPages);
    expect(nav.attributes('data-active')).toBe(
      'new_broadcast.pages.select_groups.title',
    );

    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.CONFIRM_AND_SEND);
    await nextTick();
    expect(nav.attributes('data-active')).toBe(
      'new_broadcast.pages.confirm_and_send.title',
    );
  });
});
