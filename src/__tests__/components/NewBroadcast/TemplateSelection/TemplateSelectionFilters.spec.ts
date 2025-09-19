import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';
import TemplateSelectionFilters from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionFilters.vue';

// i18n stub
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

// mock debounce to call immediately
vi.mock('@vueuse/core', () => ({ useDebounceFn: (fn: any) => fn }));

const SELECTOR = {
  search: '[data-test="search"]',
  newTemplate: '[data-test="new-template"]',
  setChannel: '[data-test="set-channel"]',
  clearChannel: '[data-test="clear-channel"]',
} as const;

const stubs = {
  UnnnicInput: {
    props: [
      'modelValue',
      'placeholder',
      'iconLeft',
      'iconRight',
      'iconRightClickable',
      'size',
    ],
    emits: ['update:model-value', 'icon-right-click'],
    template:
      '<input data-test="search" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" @keydown.enter.prevent @keyup.esc="$emit(\'icon-right-click\')" />',
  },
  UnnnicButton: {
    props: ['size', 'type', 'iconLeft', 'text'],
    template:
      '<button data-test="new-template" @click="$emit(\'click\')">new</button>',
  },
  UnnnicSelectSmart: {
    props: ['modelValue', 'options', 'isLoading', 'size'],
    emits: ['update:model-value'],
    template:
      '<div data-test="channel"><button data-test="set-channel" @click="$emit(\'update:model-value\', [{ label: \'WAC 1\', value: \'ch-1\' }])">set</button><button data-test="clear-channel" @click="$emit(\'update:model-value\', [])">clear</button></div>',
  },
} as const;

const mountWrapper = (search = '', channel?: any) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const projectStore = useProjectStore(pinia);
  // seed channels to show the dropdown (only WAC are considered)
  projectStore.project.channels = [
    { uuid: 'ch-1', name: 'WAC 1', channel_type: 'WAC' },
    { uuid: 'ch-2', name: 'WAC 2', channel_type: 'WAC' },
  ] as any;

  const wrapper = mount(TemplateSelectionFilters, {
    props: { search, channel },
    global: { plugins: [pinia], stubs, mocks: { $t: (k: string) => k } },
  });
  return wrapper;
};

describe('TemplateSelectionFilters.vue', () => {
  it('emits update:search with debounce on input', async () => {
    const wrapper = mountWrapper('a');
    const input = wrapper.find(SELECTOR.search);
    await input.setValue('hello');
    expect(wrapper.emitted('update:search')?.[0]).toEqual(['hello']);
  });

  it('clears search via icon-right-click (Esc)', async () => {
    const wrapper = mountWrapper('abc');
    const input = wrapper.find(SELECTOR.search);
    await input.trigger('keyup.esc');
    const emissions = wrapper.emitted('update:search') || [];
    expect(emissions[emissions.length - 1]).toEqual(['']);
  });

  it('emits update:channel when a channel is selected', async () => {
    const wrapper = mountWrapper('', undefined);
    await wrapper.find(SELECTOR.setChannel).trigger('click');
    expect(wrapper.emitted('update:channel')?.[0]).toEqual([
      { uuid: 'ch-1', name: 'WAC 1', channel_type: 'WAC' },
    ]);
  });

  it('emits undefined for channel when cleared', async () => {
    const wrapper = mountWrapper('', { uuid: 'ch-1', name: 'WAC 1' });
    await wrapper.find(SELECTOR.clearChannel).trigger('click');
    // the component maps [] to undefined when emitting upward
    // our stub directly emits [], parent maps it to undefined → emitted value should be undefined
    expect(wrapper.emitted('update:channel')?.[0]).toEqual([undefined]);
  });
});
