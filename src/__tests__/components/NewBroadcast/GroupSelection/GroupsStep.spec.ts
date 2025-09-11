import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import GroupsStep from '@/components/NewBroadcast/GroupSelection/GroupsStep.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useContactImportStore } from '@/stores/contactImport';
import { useProjectStore } from '@/stores/project';
import { NewBroadcastPage } from '@/constants/broadcasts';

// i18n stub
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const STUBS = {
  GroupSelection: {
    props: ['open'],
    emits: ['update:open'],
    template:
      '<div data-test="group-selection" :data-open="open"><button data-test="toggle-groups" @click="$emit(\'update:open\', !open)">toggle</button></div>',
  },
  ContactImport: {
    props: ['open'],
    emits: ['update:open'],
    template:
      '<div data-test="contact-import" :data-open="open"><button data-test="toggle-import" @click="$emit(\'update:open\', !open)">toggle</button></div>',
  },
  ContactImportProcessing: {
    template: '<div data-test="import-processing" />',
  },
  StepActions: {
    props: ['disabled'],
    emits: ['cancel', 'continue'],
    template:
      '<div data-test="actions"><button data-test="cancel" @click="$emit(\'cancel\')">cancel</button><button data-test="continue" :disabled="disabled" @click="$emit(\'continue\')">continue</button></div>',
  },
} as const;

const SELECTOR = {
  toggleGroups: '[data-test="toggle-groups"]',
  toggleImport: '[data-test="toggle-import"]',
  cancel: '[data-test="cancel"]',
  cont: '[data-test="continue"]',
  processing: '[data-test="import-processing"]',
} as const;

const mountWrapper = (props?: { uploadFinished?: boolean }) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const contactImportStore = useContactImportStore(pinia);
  const projectStore = useProjectStore(pinia);
  // defaults
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
  broadcastsStore.setSelectedGroups([]);
  contactImportStore.import = undefined as any;

  const wrapper = mount(GroupsStep, {
    props: { uploadFinished: props?.uploadFinished ?? false },
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, broadcastsStore, contactImportStore, projectStore };
};

describe('GroupsStep.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enables continue when groups selected', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    broadcastsStore.setSelectedGroups([{} as any]);
    await wrapper.vm.$nextTick();

    const continueBtn = wrapper.find(SELECTOR.cont);
    expect(continueBtn.attributes('disabled')).toBeUndefined();
  });

  it('shows processing when import exists and upload finished', async () => {
    const { wrapper, contactImportStore } = mountWrapper({
      uploadFinished: false,
    });
    contactImportStore.import = { importId: 1 } as any;
    await wrapper.setProps({ uploadFinished: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(SELECTOR.processing).exists()).toBe(true);
  });

  it('cancel clears import and resets page', async () => {
    const { wrapper, contactImportStore, broadcastsStore } = mountWrapper();
    contactImportStore.import = { importId: 1 } as any;
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    await wrapper.find(SELECTOR.cancel).trigger('click');

    expect(contactImportStore.import).toBeUndefined();
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_GROUPS);
  });

  it('continue confirms import when available', async () => {
    const { wrapper, contactImportStore, projectStore, broadcastsStore } =
      mountWrapper({ uploadFinished: true });
    projectStore.setProjectUuid('uuid');
    contactImportStore.import = { importId: 123 } as any;
    await wrapper.vm.$nextTick();
    const confirmSpy = vi
      .spyOn(contactImportStore, 'confirmContactImport')
      .mockResolvedValue(undefined as any);
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    await wrapper.find(SELECTOR.cont).trigger('click');
    expect(confirmSpy).toHaveBeenCalled();
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_TEMPLATE);
  });
});
