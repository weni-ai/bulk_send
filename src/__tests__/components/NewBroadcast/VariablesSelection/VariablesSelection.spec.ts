import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import VariablesSelection from '@/components/NewBroadcast/VariablesSelection/VariablesSelection.vue';
import { useContactStore } from '@/stores/contact';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  UnnnicFormElement: {
    props: ['label'],
    template: '<div data-test="form-element"><slot /></div>',
  },
  UnnnicSelectSmart: {
    props: [
      'options',
      'modelValue',
      'placeholder',
      'isLoading',
      'autocomplete',
      'autocompleteClearOnFocus',
      'enableSearchByValue',
    ],
    emits: ['update:model-value'],
    template: '<select data-test="variable-select"></select>',
  },
  UnnnicDisclaimer: {
    props: ['icon', 'text', 'scheme'],
    template: '<div data-test="disclaimer">{{ text }}</div>',
  },
  TemplateSelectionPreview: {
    props: ['variablesToReplace'],
    template:
      '<div data-test="preview">{{ variablesToReplace.join(",") }}</div>',
  },
  VariablesSelectionOverview: {
    props: ['definedVariables'],
    template: '<div data-test="overview">{{ definedVariables.length }}</div>',
  },
  VariablesSelectionHeaderMedia: {
    template: '<div data-test="header-media" />',
  },
  StepActions: {
    props: ['disabled'],
    emits: ['cancel', 'continue'],
    template:
      '<div data-test="actions"><button data-test="actions-cancel" @click="$emit(\'cancel\')">cancel</button><button data-test="actions-continue" :disabled="disabled" @click="$emit(\'continue\')">continue</button></div>',
  },
} as const;

const SELECTOR = {
  formElement: '[data-test="form-element"]',
  variableSelect: '[data-test="variable-select"]',
  disclaimer: '[data-test="disclaimer"]',
  overview: '[data-test="overview"]',
  preview: '[data-test="preview"]',
  actionsCancel: '[data-test="actions-cancel"]',
  actionsContinue: '[data-test="actions-continue"]',
} as const;

const mountWrapper = (variableCount = 2) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const contactStore = useContactStore(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);

  // seed contact fields and examples
  contactStore.contactFields = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
  ] as any;
  contactStore.contactFieldsExamples = [
    { key: 'name', example: 'Alice' },
    { key: 'age', example: '30' },
  ] as any;

  // stub async fetches called on mount
  vi.spyOn(contactStore, 'fetchContactFields').mockResolvedValue(
    undefined as any,
  );
  vi.spyOn(contactStore, 'getContactFieldsExamplesByGroups').mockResolvedValue(
    undefined as any,
  );

  // seed selected template and groups
  broadcastsStore.newBroadcast.selectedTemplate = {
    variableCount,
    header: { type: 'TEXT' },
  } as any;
  broadcastsStore.newBroadcast.selectedGroups = [] as any;

  const wrapper = mount(VariablesSelection, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, contactStore, broadcastsStore };
};

describe('VariablesSelection.vue', () => {
  it('renders inputs equal to template variable count', () => {
    const { wrapper } = mountWrapper(3);
    const inputs = wrapper.findAll(SELECTOR.formElement);
    expect(inputs.length).toBe(3);
  });

  it('initializes variable mapping on mount', () => {
    const { broadcastsStore } = mountWrapper(2);
    expect(Object.keys(broadcastsStore.newBroadcast.variableMapping)).toEqual([
      '0',
      '1',
    ]);
    expect(
      Object.values(broadcastsStore.newBroadcast.variableMapping).every(
        (v) => v === undefined,
      ),
    ).toBe(true);
  });

  it('shows overview and disclaimer when at least one variable is mapped', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(2);
    broadcastsStore.updateVariableMapping(0, {
      key: 'name',
      label: 'Name',
    } as any);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(SELECTOR.overview).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.disclaimer).exists()).toBe(true);
  });

  it('computes variablesToReplace from contactFieldsExamples matching current mapping order', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(2);
    broadcastsStore.updateVariableMapping(0, {
      key: 'name',
      label: 'Name',
    } as any);
    broadcastsStore.updateVariableMapping(1, {
      key: 'age',
      label: 'Age',
    } as any);
    await wrapper.vm.$nextTick();

    const preview = wrapper.find(SELECTOR.preview);
    expect(preview.text()).toBe('Alice,30');
  });

  it('disables continue until all variables are mapped', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(2);
    // initially all undefined
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    broadcastsStore.updateVariableMapping(0, {
      key: 'name',
      label: 'Name',
    } as any);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    broadcastsStore.updateVariableMapping(1, {
      key: 'age',
      label: 'Age',
    } as any);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeUndefined();
  });

  it('cancel clears mapping and returns to template page', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(1);
    broadcastsStore.updateVariableMapping(0, {
      key: 'name',
      label: 'Name',
    } as any);
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    await wrapper.find(SELECTOR.actionsCancel).trigger('click');
    expect(
      Object.values(broadcastsStore.newBroadcast.variableMapping).every(
        (v) => v === undefined,
      ),
    ).toBe(true);
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_TEMPLATE);
  });

  it('continue proceeds to confirm and send page', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(1);
    broadcastsStore.updateVariableMapping(0, {
      key: 'name',
      label: 'Name',
    } as any);
    await wrapper.vm.$nextTick();
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    await wrapper.find(SELECTOR.actionsContinue).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.CONFIRM_AND_SEND);
  });

  it('requires header media when header is not TEXT and enables after upload', async () => {
    const { wrapper, broadcastsStore } = mountWrapper(0);
    // require media header
    broadcastsStore.newBroadcast.selectedTemplate = {
      variableCount: 0,
      header: { type: 'IMAGE' },
    } as any;
    await wrapper.vm.$nextTick();

    // disabled because header media missing
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    // set media url
    broadcastsStore.setHeaderMediaFileUrl('https://cdn.example.com/file.jpg');
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeUndefined();

    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.CONFIRM_AND_SEND);
  });
});
