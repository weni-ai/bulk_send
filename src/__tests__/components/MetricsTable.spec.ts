import { describe, it, expect, vi } from 'vitest';
import { DOMWrapper, mount, VueWrapper } from '@vue/test-utils';
import MetricsTable from '@/components/MetricsTable.vue';

const mockData = [
  { label: 'Metric 1', value: '100' },
  { label: 'Metric 2', value: '200', hint: 'This is a hint' },
  {
    label: 'Metric 3',
    value: '300',
    actions: [{ label: 'Action 1', icon: 'icon-1', onClick: vi.fn() }],
  },
  { label: 'Metric 4', value: '400' },
];

const stubs = {
  UnnnicToolTip: {
    props: ['side'],
    template: '<div class="unnnic-tooltip-stub" :data-side="side"><slot /></div>',
  },
  UnnnicIcon: { template: '<div class="unnnic-icon-stub"></div>' },
  UnnnicDropdown: {
    template: '<div class="unnnic-dropdown-stub"><slot name="trigger" /><slot /></div>',
  },
  UnnnicDropdownItem: {
    emits: ['click'],
    template:
      '<div class="unnnic-dropdown-item-stub" @click="$emit(\'click\')"><slot /></div>',
  },
};

const checkCell = (
  cell: DOMWrapper<Element>,
  label: string,
  value: string,
) => {
  expect(cell.text()).toContain(label);
  expect(cell.text()).toContain(value);
};

const mountWrapper = (props: any): VueWrapper => {
  return mount(MetricsTable, {
    props,
    global: {
      stubs,
    },
  });
};

describe('MetricsTable.vue', () => {
  it('should render rows and cells correctly based on maxColumns', () => {
    const wrapper = mountWrapper({
      maxColumns: 2,
      data: mockData,
    });

    const rows = wrapper.findAll('.metrics-table__row');
    expect(rows).toHaveLength(2);

    const firstRowCells = rows[0].findAll('.metrics-table__row__cell');
    expect(firstRowCells).toHaveLength(2);
    checkCell(firstRowCells[0], 'Metric 1', '100');
    checkCell(firstRowCells[1], 'Metric 2', '200');

    const secondRowCells = rows[1].findAll('.metrics-table__row__cell');
    expect(secondRowCells).toHaveLength(2);
    checkCell(secondRowCells[0], 'Metric 3', '300');
    checkCell(secondRowCells[1], 'Metric 4', '400');
  });

  it('should display a tooltip when hint is provided', () => {
    const wrapper = mountWrapper({
      maxColumns: 4,
      data: mockData,
    });

    const tooltips = wrapper.findAll('.unnnic-tooltip-stub');
    expect(tooltips).toHaveLength(1);
    const cells = wrapper.findAll('.metrics-table__row__cell');
    expect(cells[1].find('.unnnic-tooltip-stub').exists()).toBe(true);
  });

  it('should display actions dropdown when actions are provided', () => {
    const wrapper = mountWrapper({
      maxColumns: 4,
      data: mockData,
    });

    const dropdowns = wrapper.findAll('.unnnic-dropdown-stub');
    expect(dropdowns).toHaveLength(1);
    const cells = wrapper.findAll('.metrics-table__row__cell');
    expect(cells[2].find('.unnnic-dropdown-stub').exists()).toBe(true);
  });

  it('should call action onClick when an action is clicked', async () => {
    const onClickMock = vi.fn();
    const dataWithAction = [
      {
        label: 'Metric 1',
        value: '100',
        actions: [{ label: 'Click Me', icon: 'click', onClick: onClickMock }],
      },
    ];

    const wrapper = mountWrapper({
      maxColumns: 1,
      data: dataWithAction,
    });

    const dropdownItem = wrapper.find('.unnnic-dropdown-item-stub');
    await dropdownItem.trigger('click');

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('calculates tooltipSide correctly', () => {
    const wrapper = mountWrapper({
      maxColumns: 3,
      data: [
        { label: '1', value: '1', hint: 'h' },
        { label: '2', value: '2', hint: 'h' },
        { label: '3', value: '3', hint: 'h' },
      ],
    });

    const tooltips = wrapper.findAll('.unnnic-tooltip-stub');
    expect(tooltips[0].attributes('data-side')).toBe('right');
    expect(tooltips[1].attributes('data-side')).toBe('top');
    expect(tooltips[2].attributes('data-side')).toBe('left');
  });
});
