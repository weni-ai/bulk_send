import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useBroadcastsStore } from '@/stores/broadcasts';
import ContactImport from '@/components/NewBroadcast/ContactImport/ContactImport.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  UnnnicCollapse: {
    props: ['modelValue'],
    emits: ['update:model-value'],
    template:
      '<div data-test="collapse" :data-open="modelValue"><button data-test="toggle" @click="$emit(\'update:model-value\', !modelValue)">toggle</button><slot name="header" /><slot /></div>',
  },
  UnnnicDisclaimer: {
    props: ['icon', 'text'],
    template: '<div data-test="disclaimer">{{ text }}</div>',
  },
  ContactImportUpload: {
    name: 'ContactImportUpload',
    props: ['disabled'],
    emits: ['finished'],
    template: '<div data-test="upload" />',
  },
} as const;

const SELECTOR = {
  toggle: '[data-test="toggle"]',
  disclaimer: '[data-test="disclaimer"]',
} as const;

const mountWrapper = (open = true) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const wrapper = mount(ContactImport, {
    props: { open },
    global: {
      plugins: [pinia],
      stubs: STUBS,
      mocks: { $t: (key: string) => key },
    },
  });
  return { wrapper, broadcastsStore };
};

describe('ContactImport.vue', () => {
  it('emits update:open via collapse toggle', async () => {
    const { wrapper } = mountWrapper(true);
    await wrapper.find(SELECTOR.toggle).trigger('click');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('shows disclaimer when broadcastsStore has selected groups', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(true);
    broadcastsStore.setSelectedGroups([
      { id: 1, uuid: 'u1', name: 'G1', memberCount: 10 },
    ] as any);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(SELECTOR.disclaimer).exists()).toBe(true);
  });

  it('hides disclaimer when no selected groups', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(true);
    broadcastsStore.setSelectedGroups([]);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(SELECTOR.disclaimer).exists()).toBe(false);
  });

  it('forwards disabled prop to ContactImportUpload based on selected groups', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(true);
    // No groups selected
    broadcastsStore.setSelectedGroups([]);
    await wrapper.vm.$nextTick();
    let upload = wrapper.findComponent({ name: 'ContactImportUpload' });
    expect(upload.exists()).toBe(true);
    expect(upload.props('disabled')).toBe(false);

    // With groups selected
    broadcastsStore.setSelectedGroups([
      { id: 1, uuid: 'uuid', name: 'G', memberCount: 1 },
    ] as any);
    await wrapper.vm.$nextTick();
    upload = wrapper.findComponent({ name: 'ContactImportUpload' });
    expect(upload.props('disabled')).toBe(true);
  });

  it('emits uploaded when ContactImportUpload emits finished', async () => {
    const { wrapper } = mountWrapper(true);
    const upload = wrapper.findComponent({ name: 'ContactImportUpload' });
    upload.vm.$emit('finished');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('uploaded')).toBeTruthy();
  });
});
