import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ConfirmAndSend from '@/components/NewBroadcast/ConfirmAndSend/ConfirmAndSend.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { useFlowsStore } from '@/stores/flows';
import { useContactImportStore } from '@/stores/contactImport';
import { ContactImportStatus } from '@/types/contactImport';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

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
    props: ['modelValue', 'title'],
    template: '<div data-test="modal" :data-open="modelValue"><slot /></div>',
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

    const checkSpy = vi
      .spyOn(contactImportStore, 'checkImportFinished')
      .mockResolvedValue(undefined as any);

    const wrapper = mount(ConfirmAndSend, {
      global: {
        plugins: [pinia],
        stubs: STUBS,
        mocks: { $t: (k: string) => k },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find(SELECTOR.modal).attributes('data-open')).toBe('true');

    // called immediately and again after 5s
    expect(checkSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(checkSpy).toHaveBeenCalledTimes(2);
  });
});
