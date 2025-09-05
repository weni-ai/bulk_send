import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TemplateSelectionListRow from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionListRow.vue';

const SELECTOR = {
  row: '[data-test="template-list-row"]',
} as const;

describe('TemplateSelectionListRow.vue', () => {
  it('sets data-selected accordingly', () => {
    const wrapper = mount(TemplateSelectionListRow, {
      props: { selected: true },
    });
    expect(wrapper.find(SELECTOR.row).attributes('data-selected')).toBe('true');

    wrapper.setProps({ selected: false });
    expect(wrapper.find(SELECTOR.row).attributes('data-selected')).toBe(
      'false',
    );
  });

  it('renders value prop when provided', () => {
    const wrapper = mount(TemplateSelectionListRow, {
      props: { selected: false, value: 'Hello' },
    });
    expect(wrapper.find(SELECTOR.row).text()).toContain('Hello');
  });

  it('renders slot content in named slot "value"', () => {
    const wrapper = mount(TemplateSelectionListRow, {
      props: { selected: false },
      slots: {
        value: '<span data-test="slot-value">World</span>',
      },
    });
    expect(wrapper.find('[data-test="slot-value"]').exists()).toBe(true);
    expect(wrapper.find(SELECTOR.row).text()).toContain('World');
  });
});
