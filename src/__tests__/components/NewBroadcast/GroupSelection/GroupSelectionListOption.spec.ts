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

  it('emits update:selected=true when clicking root and selected=false', async () => {
    const wrapper = mountWrapper({ selected: false });
    await wrapper.find(SELECTOR.root).trigger('click');
    expect(wrapper.emitted('update:selected')).toEqual([[true]]);
  });

  it('emits update:selected=false when clicking root and selected=true', async () => {
    const wrapper = mountWrapper({ selected: true });
    await wrapper.find(SELECTOR.root).trigger('click');
    expect(wrapper.emitted('update:selected')).toEqual([[false]]);
  });

  it('checkbox reflects selected prop', () => {
    const wrapperSelected = mountWrapper({ selected: true });
    const checkboxSelected = wrapperSelected.find(SELECTOR.checkbox)
      .element as HTMLInputElement;
    expect(checkboxSelected.checked).toBe(true);

    const wrapperUnselected = mountWrapper({ selected: false });
    const checkboxUnselected = wrapperUnselected.find(SELECTOR.checkbox)
      .element as HTMLInputElement;
    expect(checkboxUnselected.checked).toBe(false);
  });
});
