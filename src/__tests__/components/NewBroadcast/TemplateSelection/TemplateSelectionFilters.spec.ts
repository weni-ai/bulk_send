import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TemplateSelectionFilters from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionFilters.vue';

// i18n stub
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

// mock debounce to call immediately
vi.mock('@vueuse/core', () => ({ useDebounceFn: (fn: any) => fn }));

const SELECTOR = {
  search: '[data-test="search"]',
  newTemplate: '[data-test="new-template"]',
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
};

const mountWrapper = (search = '') =>
  mount(TemplateSelectionFilters, {
    props: { search },
    global: { stubs, mocks: { $t: (k: string) => k } },
  });

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

  it('renders new template button (click handler noop)', async () => {
    const wrapper = mountWrapper();
    const btn = wrapper.find(SELECTOR.newTemplate);
    expect(btn.exists()).toBe(true);
    await btn.trigger('click');
    // no emit expected from component for click yet; just ensure no errors
  });
});
