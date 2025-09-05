import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NewBroadcast from '@/views/BulkSend/NewBroadcast.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  NewBroadcastLayout: {
    template:
      '<div><slot name="header" /><div data-test="content"><slot name="content" /></div></div>',
  },
  NewBroadcastHeader: { template: '<div data-test="header" />' },
  GroupSelection: {
    props: ['open'],
    emits: ['update:open'],
    template:
      '<div data-test="group-selection" :data-open="open"><button data-test="close-groups" @click="$emit(\'update:open\', false)">close</button></div>',
  },
  ContactImport: {
    props: ['open'],
    emits: ['update:open'],
    template:
      '<div data-test="contact-import" :data-open="open"><button data-test="close-import" @click="$emit(\'update:open\', false)">close</button></div>',
  },
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const setPageSpy = vi
    .spyOn(broadcastsStore, 'setNewBroadcastPage')
    .mockImplementation(() => {});
  const wrapper = mount(NewBroadcast, {
    global: { plugins: [pinia], stubs: STUBS },
  });
  return { wrapper, setPageSpy };
};

const SELECTOR = {
  header: '[data-test="header"]',
  content: '[data-test="content"]',
  groupSelection: '[data-test="group-selection"]',
  contactImport: '[data-test="contact-import"]',
  closeGroups: '[data-test="close-groups"]',
  closeImport: '[data-test="close-import"]',
} as const;

describe('NewBroadcast.vue', () => {
  it('renders layout areas and sets initial page on mount', () => {
    const { wrapper, setPageSpy } = mountWrapper();
    expect(setPageSpy).toHaveBeenCalled();
    expect(wrapper.find(SELECTOR.header).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.content).exists()).toBe(true);
    // defaults: group open, import closed
    expect(wrapper.find(SELECTOR.groupSelection).attributes('data-open')).toBe(
      'true',
    );
    expect(wrapper.find(SELECTOR.contactImport).attributes('data-open')).toBe(
      'false',
    );
  });

  it('toggles sections when group selection open changes', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.find(SELECTOR.closeGroups).trigger('click');
    expect(wrapper.find(SELECTOR.groupSelection).attributes('data-open')).toBe(
      'false',
    );
    expect(wrapper.find(SELECTOR.contactImport).attributes('data-open')).toBe(
      'true',
    );
  });

  it('toggles sections when contact import open changes', async () => {
    const { wrapper } = mountWrapper();
    // first close groups to open import
    await wrapper.find(SELECTOR.closeGroups).trigger('click');
    // now close import to reopen groups
    await wrapper.find(SELECTOR.closeImport).trigger('click');
    expect(wrapper.find(SELECTOR.groupSelection).attributes('data-open')).toBe(
      'true',
    );
    expect(wrapper.find(SELECTOR.contactImport).attributes('data-open')).toBe(
      'false',
    );
  });
});
