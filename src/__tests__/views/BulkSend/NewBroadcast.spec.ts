import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NewBroadcast from '@/views/BulkSend/NewBroadcast.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';

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
  const setPageSpy = vi.spyOn(broadcastsStore, 'setNewBroadcastPage');
  const wrapper = mount(NewBroadcast, {
    global: { plugins: [pinia], stubs: STUBS },
  });
  return { wrapper, setPageSpy };
};

describe('NewBroadcast.vue', () => {
  it('renders layout areas and sets initial page on mount', () => {
    const { wrapper, setPageSpy } = mountWrapper();
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_GROUPS);
    expect(wrapper.find('[data-test="header"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="content"]').exists()).toBe(true);
    // defaults: group open, import closed
    expect(
      wrapper.find('[data-test="group-selection"]').attributes('data-open'),
    ).toBe('true');
    expect(
      wrapper.find('[data-test="contact-import"]').attributes('data-open'),
    ).toBe('false');
  });

  it('toggles sections when group selection open changes', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.find('[data-test="close-groups"]').trigger('click');
    expect(
      wrapper.find('[data-test="group-selection"]').attributes('data-open'),
    ).toBe('false');
    expect(
      wrapper.find('[data-test="contact-import"]').attributes('data-open'),
    ).toBe('true');
  });

  it('toggles sections when contact import open changes', async () => {
    const { wrapper } = mountWrapper();
    // first close groups to open import
    await wrapper.find('[data-test="close-groups"]').trigger('click');
    // now close import to reopen groups
    await wrapper.find('[data-test="close-import"]').trigger('click');
    expect(
      wrapper.find('[data-test="group-selection"]').attributes('data-open'),
    ).toBe('true');
    expect(
      wrapper.find('[data-test="contact-import"]').attributes('data-open'),
    ).toBe('false');
  });
});
