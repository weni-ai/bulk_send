import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContactImportProcessingOverview from '@/components/NewBroadcast/ContactImport/ContactImportProcessingOverview.vue';
import { useContactImportStore } from '@/stores/contactImport';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'count' in params ? `${key}` : key,
  }),
}));

const STUBS = {
  UnnnicIcon: {
    props: ['icon', 'size'],
    template: '<i data-test="icon"></i>',
  },
} as const;

const SELECTOR = {
  fileName: '[data-test="overview-file-name"]',
  contactCount: '[data-test="overview-contact-count"]',
  remove: '[data-test="overview-remove"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const contactImportStore = useContactImportStore(pinia);
  const wrapper = mount(ContactImportProcessingOverview, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, contactImportStore };
};

describe('ContactImportProcessingOverview.vue', () => {
  it('renders file name and contact count from store', async () => {
    const { wrapper, contactImportStore } = mountWrapper();

    // seed store
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    contactImportStore.import = {
      importId: 1,
      numRecords: 42,
      columns: [],
      fields: [],
      errors: [],
      file,
      duplicatedContactsCount: 0,
    } as any;

    await wrapper.vm.$nextTick();

    expect(wrapper.find(SELECTOR.fileName).text()).toBe('contacts.csv');
    expect(wrapper.find(SELECTOR.contactCount).exists()).toBe(true);
  });

  it('clears import when remove is clicked', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    // seed store
    contactImportStore.import = {
      importId: 1,
      numRecords: 5,
      columns: [],
      fields: [],
      errors: [],
      file: new File(['x'], 'x.csv', { type: 'text/csv' }),
      duplicatedContactsCount: 0,
    } as any;

    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.remove).trigger('click');
    expect(contactImportStore.import).toBeUndefined();
  });
});
