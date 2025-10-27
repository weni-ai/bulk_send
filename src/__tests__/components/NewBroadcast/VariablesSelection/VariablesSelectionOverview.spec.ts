import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VariablesSelectionOverview from '@/components/NewBroadcast/VariablesSelection/VariablesSelectionOverview.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const SELECTOR = {
  root: '[data-test="variables-overview"]',
  title: '[data-test="variables-overview-title"]',
  item: '[data-test="variables-overview-item"]',
  itemLabel: '[data-test="variables-overview-item-label"]',
  itemValue: '[data-test="variables-overview-item-value"]',
} as const;

const stubs = {
  UnnnicIcon: {
    props: ['icon', 'scheme'],
    template: '<i data-test="icon"></i>',
  },
} as const;

describe('VariablesSelectionOverview.vue', () => {
  it('renders title when provided and lists defined variables', () => {
    const wrapper = mount(VariablesSelectionOverview, {
      props: {
        title: 'Selected variables',
        definedVariables: [
          { key: 'name', label: 'Name' },
          { key: 'age', label: 'Age' },
        ] as any,
      },
      global: { stubs, mocks: { $t: (k: string) => k } },
    });

    expect(wrapper.find(SELECTOR.root).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.title).text()).toBe('Selected variables');
    const items = wrapper.findAll(SELECTOR.item);
    expect(items.length).toBe(2);
    expect(items[0].find(SELECTOR.itemValue).text()).toBe('Name');
    expect(items[1].find(SELECTOR.itemValue).text()).toBe('Age');
  });

  it('omits title when not provided', () => {
    const wrapper = mount(VariablesSelectionOverview, {
      props: {
        definedVariables: [{ key: 'name', label: 'Name' }] as any,
      },
      global: { stubs, mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(SELECTOR.title).exists()).toBe(false);
  });
});
