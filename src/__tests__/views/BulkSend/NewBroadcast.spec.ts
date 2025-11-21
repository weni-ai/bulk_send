import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NewBroadcast from '@/views/BulkSend/NewBroadcast.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { useTemplatesStore } from '@/stores/templates';
import { CHANNEL_MOCK } from '@/__tests__/mocks/channel';

vi.mock('vue-router', () => ({
  useRouter: () => ({ back: vi.fn() }),
  useRoute: () => ({ params: { channelUuid: CHANNEL_MOCK.uuid } }),
}));
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  UnnnicButton: {
    props: ['type', 'disabled'],
    template: '<button data-test="unnnic-button"><slot /></button>',
  },
  TemplateSelection: { template: '<div data-test="template-selection" />' },
  ContactImportProcessing: {
    template: '<div data-test="contact-import-processing" />',
  },
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
  const projectStore = useProjectStore(pinia);
  const templatesStore = useTemplatesStore(pinia);

  const setPageSpy = vi
    .spyOn(broadcastsStore, 'setNewBroadcastPage')
    .mockImplementation(() => {});

  const getProjectInfoSpy = vi
    .spyOn(projectStore, 'getProjectInfo')
    .mockResolvedValue();

  const getProjectChannelsSpy = vi
    .spyOn(projectStore, 'getProjectChannels')
    .mockResolvedValue();

  const getTemplatePricingSpy = vi
    .spyOn(templatesStore, 'getTemplatePricing')
    .mockResolvedValue();

  const wrapper = mount(NewBroadcast, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return {
    wrapper,
    setPageSpy,
    getProjectInfoSpy,
    getProjectChannelsSpy,
    getTemplatePricingSpy,
  };
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
