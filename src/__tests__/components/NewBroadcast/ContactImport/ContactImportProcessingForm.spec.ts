import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContactImportProcessingForm from '@/components/NewBroadcast/ContactImport/ContactImportProcessingForm.vue';
import { useContactImportStore } from '@/stores/contactImport';
import { useGroupsStore } from '@/stores/groups';
import { ContactImportGroupMode } from '@/types/contactImport';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  UnnnicRadio: {
    props: ['value', 'modelValue'],
    emits: ['update:model-value'],
    template:
      '<button data-test="radio" :data-value="value" :data-checked="modelValue===value" @click="$emit(\'update:model-value\', value)"><slot /></button>',
  },
  UnnnicInput: {
    props: ['modelValue', 'placeholder', 'size'],
    emits: ['update:model-value'],
    template:
      '<input data-test="group-name" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
  },
  UnnnicSelectSmart: {
    name: 'UnnnicSelectSmart',
    props: [
      'modelValue',
      'options',
      'isLoading',
      'size',
      'autocomplete',
      'autocompleteClearOnFocus',
      'autocompleteIconLeft',
    ],
    emits: ['update:model-value'],
    template:
      '<select data-test="group-select" @change="$emit(\'update:model-value\', [options.find(o => o.value == $event.target.value)])"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select>',
  },
} as const;

const SELECTOR = {
  radio: '[data-test="radio"]',
  groupName: '[data-test="group-name"]',
  groupSelect: '[data-test="group-select"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const contactImportStore = useContactImportStore(pinia);
  const groupsStore = useGroupsStore(pinia);

  groupsStore.groups = [
    { id: 1, uuid: 'g1', name: 'Group 1', memberCount: 10 } as any,
    { id: 2, uuid: 'g2', name: 'Group 2', memberCount: 5 } as any,
  ];

  const wrapper = mount(ContactImportProcessingForm, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, contactImportStore, groupsStore };
};

describe('ContactImportProcessingForm.vue', () => {
  it('switches action type and updates store flags and modes', async () => {
    const { wrapper, contactImportStore } = mountWrapper();

    const radios = wrapper.findAll(SELECTOR.radio);
    // click ADD option
    await radios[1].trigger('click');
    expect(contactImportStore.importProcessing.addToGroup).toBe(true);
    expect(contactImportStore.importProcessing.groupMode).toBe(
      ContactImportGroupMode.EXISTING,
    );
  });

  it('updates group name in store when typing', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    const input = wrapper.find(SELECTOR.groupName);
    await input.setValue('New Group');
    expect(contactImportStore.importProcessing.groupName).toBe('New Group');
  });

  it('selects existing group and updates store', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    const radios = wrapper.findAll(SELECTOR.radio);
    // switch to ADD existing group
    await radios[1].trigger('click');
    const select = wrapper.find(SELECTOR.groupSelect);
    await select.setValue('2');
    expect(contactImportStore.importProcessing.group?.id).toBe(2);
    expect(contactImportStore.importProcessing.group?.name).toBe('Group 2');
  });
});
