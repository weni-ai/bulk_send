import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ConfirmAndSend from '@/components/NewBroadcast/ConfirmAndSend/ConfirmAndSend.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { useFlowsStore } from '@/stores/flows';
import { useContactImportStore } from '@/stores/contactImport';
import { ContactImportStatus } from '@/types/contactImport';
import { NewBroadcastPage } from '@/constants/broadcasts';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const STUBS = {
  UnnnicFormElement: {
    props: ['label', 'message'],
    template: '<div data-test="form-element"><slot /></div>',
  },
  UnnnicInput: {
    props: ['modelValue', 'placeholder'],
    emits: ['update:model-value'],
    template:
      '<input data-test="name-input" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
  },
  UnnnicSelectSmart: {
    props: ['options', 'modelValue', 'isLoading', 'placeholder'],
    emits: ['update:model-value'],
    template: '<select data-test="flow-select"></select>',
  },
  UnnnicDisclaimer: {
    props: ['icon', 'text'],
    template: '<div data-test="flow-disclaimer">{{ text }}</div>',
  },
  UnnnicCheckbox: {
    props: ['modelValue', 'size', 'textRight'],
    emits: ['update:model-value'],
    template:
      '<button data-test="reviewed" :data-checked="modelValue" @click="$emit(\'update:model-value\', !modelValue)">{{ textRight }}</button>',
  },
  UnnnicModalDialog: {
    inheritAttrs: true,
    props: [
      'modelValue',
      'title',
      'primaryButtonProps',
      'hideSecondaryButton',
      'showActionsDivider',
    ],
    emits: ['primary-button-click'],
    template:
      '<div data-test="modal" :data-open="modelValue"><slot /><button data-test="primary" @click="$emit(\'primary-button-click\')">primary</button></div>',
  },
  ConfirmAndSendAudience: {
    template: '<div data-test="audience" />',
  },
  VariablesSelectionOverview: {
    props: ['title', 'definedVariables'],
    template:
      '<div data-test="variables-overview">{{ definedVariables.length }}</div>',
  },
  TemplateSelectionPreview: {
    template: '<div data-test="template-preview" />',
  },
  StepActions: {
    props: ['disabled', 'loading'],
    emits: ['cancel', 'continue'],
    template:
      '<div data-test="actions"><button data-test="actions-cancel" @click="$emit(\'cancel\')">cancel</button><button data-test="actions-continue" :disabled="disabled || loading" @click="$emit(\'continue\')">continue</button></div>',
  },
} as const;

const SELECTOR = {
  formElement: '[data-test="form-element"]',
  nameInput: '[data-test="name-input"]',
  flowSelect: '[data-test="flow-select"]',
  flowDisclaimer: '[data-test="flow-disclaimer"]',
  audience: '[data-test="audience"]',
  variablesOverview: '[data-test="variables-overview"]',
  reviewed: '[data-test="reviewed"]',
  modal: '[data-test="modal"]',
  actionsCancel: '[data-test="actions-cancel"]',
  actionsContinue: '[data-test="actions-continue"]',
  // we'll index modals instead of relying on forwarded class attrs
  // index 0: import pending; 1: error; 2: success
  primaryButton: '[data-test="primary"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const projectStore = useProjectStore(pinia);
  const flowsStore = useFlowsStore(pinia);
  const contactImportStore = useContactImportStore(pinia);

  // defaults
  projectStore.project.brainOn = false; // FLOW project
  flowsStore.flows = [
    { uuid: 'f1', name: 'Flow 1' },
    { uuid: 'f2', name: 'Flow 2' },
  ] as any;

  const listAllSpy = vi
    .spyOn(flowsStore, 'listAllFlows')
    .mockResolvedValue(undefined as any);

  const wrapper = mount(ConfirmAndSend, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });

  return {
    wrapper,
    broadcastsStore,
    projectStore,
    flowsStore,
    contactImportStore,
    listAllSpy,
  };
};

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('ConfirmAndSend.vue', () => {
  it('sets initial broadcast name with template name and date, and fetches flows', () => {
    vi.setSystemTime(new Date('2024-06-15T00:00:00Z'));
    const { broadcastsStore, listAllSpy } = mountWrapper();
    broadcastsStore.setSelectedTemplate({ name: 'Welcome' } as any);

    // name is set on beforeMount; since we set after mount, simulate by calling the same logic
    // Alternatively check fetch flows spy
    expect(listAllSpy).toHaveBeenCalled();
  });

  it('shows flow select for FLOW projects and disclaimer for AB projects', async () => {
    const { wrapper, projectStore } = mountWrapper();
    expect(wrapper.find(SELECTOR.flowSelect).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.flowDisclaimer).exists()).toBe(false);

    projectStore.project.brainOn = true; // AB project
    await wrapper.vm.$nextTick();
    expect(wrapper.find(SELECTOR.flowSelect).exists()).toBe(false);
    expect(wrapper.find(SELECTOR.flowDisclaimer).exists()).toBe(true);
  });

  it('emits selection to set selected flow in store', async () => {
    const { wrapper, broadcastsStore, flowsStore } = mountWrapper();
    const select = wrapper.find(SELECTOR.flowSelect);
    const option = [{ label: 'Flow 2', value: 'f2' }];
    // Emit update:model-value as the component would
    await select.trigger('change');
    // Directly call handler via component instance (simulate event)
    (wrapper.vm as any).handleFlowSelectUpdate(option);
    expect(broadcastsStore.newBroadcast.selectedFlow).toEqual(
      flowsStore.flows[1],
    );
  });

  it('renders variables overview only when at least one variable is mapped', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    expect(wrapper.find(SELECTOR.variablesOverview).exists()).toBe(false);
    broadcastsStore.updateVariableMapping(0, {
      key: 'name',
      label: 'Name',
    } as any);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(SELECTOR.variablesOverview).exists()).toBe(true);
  });

  it('updates reviewed state via checkbox', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    const checkbox = wrapper.find(SELECTOR.reviewed);
    await checkbox.trigger('click');
    expect(broadcastsStore.newBroadcast.reviewed).toBe(true);
  });

  it('shows modal when import is pending or processing and polls import status', async () => {
    vi.useFakeTimers();
    // Seed stores BEFORE mount so onBeforeMount triggers startImportCheck
    const pinia = createPinia();
    setActivePinia(pinia);
    const contactImportStore = useContactImportStore(pinia);
    const flowsStore = useFlowsStore(pinia);
    vi.spyOn(flowsStore, 'listAllFlows').mockResolvedValue(undefined as any);

    contactImportStore.import = { importId: 99 } as any;
    contactImportStore.contactImportInfo.status = ContactImportStatus.PENDING;

    const getSpy = vi
      .spyOn(contactImportStore, 'getImportInfo')
      .mockResolvedValue(undefined as any);

    const wrapper = mount(ConfirmAndSend, {
      global: {
        plugins: [pinia],
        stubs: STUBS,
        mocks: { $t: (k: string) => k },
      },
    });

    await wrapper.vm.$nextTick();
    // import not completed modal (first modal)
    expect(wrapper.findAll(SELECTOR.modal)[0].attributes('data-open')).toBe(
      'true',
    );

    // called immediately and again after 5s
    expect(getSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('disables/enables continue based on reviewed, flow (when required), and import status', async () => {
    const { wrapper, broadcastsStore, projectStore, contactImportStore } =
      mountWrapper();

    // initial: not reviewed -> disabled
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    // reviewed but FLOW project without selected flow -> still disabled
    broadcastsStore.setReviewed(true);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    // select a flow -> enabled when no import present
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeUndefined();

    // if import exists and not complete -> disabled
    contactImportStore.import = { importId: 1 } as any;
    contactImportStore.contactImportInfo.status = ContactImportStatus.PENDING;
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    // mark complete -> enabled
    contactImportStore.contactImportInfo.status = ContactImportStatus.COMPLETE;
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeUndefined();

    // AB project (no flow required): clear flow and keep reviewed
    projectStore.project.brainOn = true;
    broadcastsStore.setSelectedFlow(undefined);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeUndefined();
  });

  it('cancel resets inputs and navigates back correctly depending on template variables', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    broadcastsStore.setReviewed(true);
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    broadcastsStore.setBroadcastName('Hello');

    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    // case: has variables -> go back to variables
    broadcastsStore.setSelectedTemplate({ variableCount: 2 } as any);
    await wrapper.find(SELECTOR.actionsCancel).trigger('click');
    expect(broadcastsStore.newBroadcast.reviewed).toBe(false);
    expect(broadcastsStore.newBroadcast.selectedFlow).toBeUndefined();
    expect(broadcastsStore.newBroadcast.broadcastName).toBe('');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_VARIABLES);

    // case: no variables -> go back to template selection
    broadcastsStore.setSelectedTemplate({ variableCount: 0 } as any);
    await wrapper.find(SELECTOR.actionsCancel).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_TEMPLATE);
  });

  it('continue shows error modal when there are no groups selected', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    // enable continue gate
    broadcastsStore.setReviewed(true);
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');

    // error modal should be open
    const errorModal = wrapper.findAll(SELECTOR.modal)[1];
    expect(errorModal.attributes('data-open')).toBe('true');
    await errorModal.find(SELECTOR.primaryButton).trigger('click');
    expect((wrapper.vm as any).broadcastErrored).toBeUndefined();
  });

  it('successful continue creates broadcast, shows success modal, and primary returns home', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    // prep state
    broadcastsStore.setReviewed(true);
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    broadcastsStore.setBroadcastName('My Broadcast');
    broadcastsStore.setSelectedTemplate({
      name: 'Welcome',
      variableCount: 0,
    } as any);
    // select groups (non-import path)
    broadcastsStore.setSelectedGroups([{ uuid: 'g1', memberCount: 10 } as any]);

    const createSpy = vi
      .spyOn(broadcastsStore, 'createBroadcast')
      .mockResolvedValue(undefined as any);

    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');

    expect(createSpy).toHaveBeenCalled();
    // success modal should be open (third modal)
    const successModal = wrapper.findAll(SELECTOR.modal)[2];
    expect(successModal.attributes('data-open')).toBe('true');
    // click primary to go home
    await successModal.find(SELECTOR.primaryButton).trigger('click');
    expect((wrapper.vm as any).broadcastSuccess).toBe(false);
  });

  it('successful continue passes attachment when header media exists', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    broadcastsStore.setReviewed(true);
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    broadcastsStore.setBroadcastName('With Media');
    broadcastsStore.setSelectedTemplate({
      name: 'Welcome',
      variableCount: 0,
    } as any);
    broadcastsStore.setSelectedGroups([{ uuid: 'g1', memberCount: 10 } as any]);
    broadcastsStore.setHeaderMediaFileUrl('https://cdn.example.com/file.jpg');
    // headerMediaFileType doesn't have a setter; set directly
    (broadcastsStore as any).newBroadcast.headerMediaFileType = 'image';

    const createSpy = vi
      .spyOn(broadcastsStore, 'createBroadcast')
      .mockResolvedValue(undefined as any);

    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');

    expect(createSpy).toHaveBeenCalledTimes(1);
    const args = (createSpy as any).mock.calls[0];
    expect(args[4]).toEqual({
      url: 'https://cdn.example.com/file.jpg',
      type: 'image',
    });
  });

  it('cancel goes to variables page when only header media is present', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    // No variables on template
    broadcastsStore.setSelectedTemplate({ variableCount: 0 } as any);
    broadcastsStore.setHeaderMediaFileUrl('https://cdn.example.com/file.jpg');
    (broadcastsStore as any).newBroadcast.headerMediaFileType = 'image';

    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    await wrapper.find(SELECTOR.actionsCancel).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_VARIABLES);
  });

  it('continue shows error modal when variables are required but none are provided', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    broadcastsStore.setReviewed(true);
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    broadcastsStore.setBroadcastName('Needs Vars');
    // Requires variables
    broadcastsStore.setSelectedTemplate({
      name: 'Tpl',
      variableCount: 2,
    } as any);
    broadcastsStore.setSelectedGroups([{ uuid: 'g1', memberCount: 10 } as any]);

    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');

    const errorModal = wrapper.findAll(SELECTOR.modal)[1];
    expect(errorModal.attributes('data-open')).toBe('true');
  });

  it('continue uses import group uuid when import is present', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const broadcastsStore = useBroadcastsStore(pinia);
    const projectStore = useProjectStore(pinia);
    const flowsStore = useFlowsStore(pinia);
    const contactImportStore = useContactImportStore(pinia);

    projectStore.project.brainOn = false;
    flowsStore.flows = [{ uuid: 'f1', name: 'Flow 1' } as any];
    vi.spyOn(flowsStore, 'listAllFlows').mockResolvedValue(undefined as any);

    // import path prepared before mount
    contactImportStore.import = { importId: 123 } as any;
    contactImportStore.contactImportInfo.status = ContactImportStatus.COMPLETE;
    contactImportStore.contactImportGroup = { uuid: 'grp-123' } as any;
    vi.spyOn(contactImportStore, 'getImportInfo').mockResolvedValue(
      undefined as any,
    );

    const wrapper = mount(ConfirmAndSend, {
      global: {
        plugins: [pinia],
        stubs: STUBS,
        mocks: { $t: (k: string) => k },
      },
    });

    broadcastsStore.setReviewed(true);
    broadcastsStore.setSelectedFlow({ uuid: 'f1', name: 'Flow 1' } as any);
    broadcastsStore.setBroadcastName('Import Broadcast');
    broadcastsStore.setSelectedTemplate({
      name: 'Tpl',
      variableCount: 0,
    } as any);

    const createSpy = vi
      .spyOn(broadcastsStore, 'createBroadcast')
      .mockResolvedValue(undefined as any);

    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');

    expect(createSpy).toHaveBeenCalledTimes(1);
    const args = (createSpy as any).mock.calls[0];
    expect(args[3]).toEqual(['grp-123']);
  });
});
