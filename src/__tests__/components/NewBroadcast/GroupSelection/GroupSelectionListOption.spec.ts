import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GroupSelectionListOption from '@/components/NewBroadcast/GroupSelection/GroupSelectionListOption.vue';

const SELECTOR = {
  root: '[data-test="group-option"]',
  title: '[data-test="group-option-title"]',
  description: '[data-test="group-option-description"]',
  checkbox: '[data-test="group-option-checkbox"]',
} as const;

const stubs = {
  UnnnicCheckbox: {
    props: ['modelValue', 'size'],
    emits: ['update:model-value'],
    template:
      '<input type="checkbox" data-test="group-option-checkbox" :checked="modelValue" @change="$emit(\'update:model-value\', !$event.target.checked ? false : true)" />',
  },
};

const mountWrapper = (
  props?: Partial<{ title: string; description: string; selected: boolean }>,
) =>
  mount(GroupSelectionListOption, {
    props: {
      title: props?.title ?? 'Group A',
      description: props?.description ?? '10 members',
      selected: props?.selected ?? false,
    },
    global: { stubs },
  });

describe('GroupSelectionListOption.vue', () => {
  it('renders title and description', () => {
    const wrapper = mountWrapper({
      title: 'Group X',
      description: '25 members',
    });
    expect(wrapper.find(SELECTOR.title).text()).toBe('Group X');
    expect(wrapper.find(SELECTOR.description).text()).toBe('25 members');
  });

  it('applies selected class when selected=true', () => {
    const wrapper = mountWrapper({ selected: true });
    expect(wrapper.find(SELECTOR.root).classes()).toContain(
      'group-selection-option--selected',
    );
  });

  it('emits update:selected when checkbox toggled', async () => {
    const wrapper = mountWrapper({ selected: false });
    const checkbox = wrapper.find(SELECTOR.checkbox);
    await checkbox.setValue(true);
    expect(wrapper.emitted('update:selected')).toEqual([[true]]);
  });
});
