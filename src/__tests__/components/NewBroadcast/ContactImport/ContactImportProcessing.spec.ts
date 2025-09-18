import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContactImportProcessing from '@/components/NewBroadcast/ContactImport/ContactImportProcessing.vue';
import { useContactImportStore } from '@/stores/contactImport';
import { useGroupsStore } from '@/stores/groups';
import { useProjectStore } from '@/stores/project';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  ContactImportProcessingOverview: {
    template: '<div data-test="overview" />',
  },
  ContactImportProcessingMapping: {
    template: '<div data-test="mapping" />',
  },
  ContactImportProcessingForm: {
    template: '<div data-test="form" />',
  },
  UnnnicDisclaimer: {
    props: ['icon', 'text'],
    template:
      '<button data-test="disclaimer" @click="$emit(\'click\', $event)">{{ text }}</button>',
  },
} as const;

const SELECTOR = {
  title: 'h1.contact-import-processing__title',
  overview: '[data-test="overview"]',
  mapping: '[data-test="mapping"]',
  form: '[data-test="form"]',
  disclaimer: '[data-test="disclaimer"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const contactImportStore = useContactImportStore(pinia);
  const groupsStore = useGroupsStore(pinia);
  const projectStore = useProjectStore(pinia);

  projectStore.setProjectUuid('project-uuid');
  contactImportStore.import = {
    importId: 1,
    numRecords: 10,
    columns: [],
    fields: [],
    errors: [],
    file: new File(['x'], 'name.csv', { type: 'text/csv' }),
    duplicates: { count: 3, downloadUrl: 'https://example.com/d.csv' },
  } as any;

  const listAllGroupsSpy = vi
    .spyOn(groupsStore, 'listAllGroups')
    .mockResolvedValue();

  const wrapper = mount(ContactImportProcessing, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, listAllGroupsSpy, contactImportStore };
};

describe('ContactImportProcessing.vue', () => {
  it('renders title, child components and disclaimer text', () => {
    const { wrapper } = mountWrapper();
    expect(wrapper.find(SELECTOR.title).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.overview).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.mapping).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.form).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.disclaimer).exists()).toBe(true);
  });

  it('lists all groups on beforeMount and sets default group name on mounted', async () => {
    const { wrapper, listAllGroupsSpy, contactImportStore } = mountWrapper();
    expect(listAllGroupsSpy).toHaveBeenCalledWith('project-uuid');
    // Wait a tick to allow onMounted logic to run
    await wrapper.vm.$nextTick();
    expect(contactImportStore.importProcessing.groupName).toBe('name');
  });

  it('when disclaimer is clicked, opens duplicates download url in new tab', async () => {
    const { wrapper } = mountWrapper();
    // mock window.open
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null as any);

    await wrapper.find(SELECTOR.disclaimer).trigger('click');
    expect(openSpy).toHaveBeenCalledWith('https://example.com/d.csv', '_blank');

    openSpy.mockRestore();
  });
});
