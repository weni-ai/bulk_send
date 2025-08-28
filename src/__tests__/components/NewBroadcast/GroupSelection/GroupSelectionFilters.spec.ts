import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GroupSelectionFilters from '@/components/NewBroadcast/GroupSelection/GroupSelectionFilters.vue';
import { SORT_OPTIONS } from '@/constants/groups';

const SELECTOR = {
  search: '[data-test="search"]',
  radio: '[data-test="radio"]',
} as const;

const stubs = {
  UnnnicInput: {
    props: [
      'modelValue',
      'placeholder',
      'iconLeft',
      'iconRight',
      'iconRightClickable',
    ],
    emits: ['update:model-value', 'icon-right-click'],
    template:
      '<input data-test="search" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" @keydown.enter.prevent @keyup.esc="$emit(\'icon-right-click\')" />',
  },
  UnnnicRadio: {
    props: ['modelValue', 'value'],
    emits: ['update:model-value'],
    template:
      '<label><input data-test="radio" type="radio" :checked="modelValue===value" @change="$emit(\'update:model-value\', value)" /><slot /></label>',
  },
};

const mountWrapper = (props?: Partial<{ search: string; sort: string }>) =>
  mount(GroupSelectionFilters, {
    props: {
      search: props?.search ?? '',
      sort: props?.sort ?? SORT_OPTIONS.ASC,
    },
    global: {
      stubs,
      mocks: { $t: (key: string) => key },
    },
  });

describe('GroupSelectionFilters.vue', () => {
  it('emits update:search on input and clears on icon-right-click', async () => {
    const wrapper = mountWrapper({ search: 'ab' });
    const search = wrapper.find(SELECTOR.search);
    await search.setValue('hello');
    expect(wrapper.emitted('update:search')?.[0]).toEqual(['hello']);

    // clear via right-icon click
    await search.trigger('keyup.esc');
    const emissions = wrapper.emitted('update:search') || [];
    expect(emissions[emissions.length - 1]).toEqual(['']);
  });

  it('emits update:sort when a radio option is selected', async () => {
    const wrapper = mountWrapper({ sort: SORT_OPTIONS.ASC });
    const radios = wrapper.findAll(SELECTOR.radio);
    // click the second option (DESC)
    await radios[1].setValue(true);
    expect(wrapper.emitted('update:sort')?.[0]).toEqual([SORT_OPTIONS.DESC]);
  });
});
