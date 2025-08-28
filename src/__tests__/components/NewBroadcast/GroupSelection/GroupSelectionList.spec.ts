import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useGroupsStore } from '@/stores/groups';
import GroupSelectionList from '@/components/NewBroadcast/GroupSelection/GroupSelectionList.vue';
import { createGroup } from '@/__tests__/utils/factories';
import type { Group } from '@/types/groups';

const SELECTOR = {
  root: '[data-test="group-list"]',
  loading: '[data-test="group-list-loading"]',
  content: '[data-test="group-list-content"]',
  row: '[data-test="group-list-row"]',
  option: '[data-test="option"]',
  empty: '[data-test="empty"]',
  footer: '[data-test="footer"]',
  nextPage: '[data-test="next-page"]',
} as const;

const stubs = {
  GroupSelectionOption: {
    props: ['title', 'description', 'selected'],
    emits: ['update:selected'],
    template:
      '<div data-test="option" :data-selected="selected" @click="$emit(\'update:selected\', !selected)">{{ title }} - {{ description }}</div>',
  },
  GroupSelectionListFooter: {
    props: ['page', 'pageSize', 'total'],
    emits: ['update:page'],
    template:
      '<div data-test="footer" :data-page="page" :data-page-size="pageSize" :data-total="total"><button data-test="next-page" @click="$emit(\'update:page\', page + 1)">next</button></div>',
  },
  GroupSelectionListEmpty: {
    template: '<div data-test="empty" />',
  },
};

const getFirstSelected = (wrapper: VueWrapper): Group[] => {
  const emissions = wrapper.emitted('update:selected-groups') as [Group[]][];
  expect(emissions.length).toBeGreaterThan(0);
  const [selected] = emissions[0];
  return selected;
};

const mountWithStore = (options: {
  groups: ReturnType<typeof createGroup>[];
  selectedGroups?: ReturnType<typeof createGroup>[];
  maxColumns?: number;
  page?: number;
  pageSize?: number;
  total?: number;
  loading?: boolean;
}) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const groupsStore = useGroupsStore(pinia);
  groupsStore.groups = options.groups as any;

  const wrapper = mount(GroupSelectionList, {
    props: {
      selectedGroups: options.selectedGroups ?? [],
      maxColumns: options.maxColumns ?? 3,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 5,
      total: options.total ?? options.groups.length,
      loading: options.loading ?? false,
    },
    global: {
      plugins: [pinia],
      stubs,
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) =>
          key.includes('group_count') ? `${params?.count} members` : key,
      },
    },
  });

  return wrapper;
};

describe('GroupSelectionList.vue', () => {
  it('shows loading state when loading=true', () => {
    const wrapper = mountWithStore({ groups: [], loading: true });
    expect(wrapper.find(SELECTOR.loading).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.content).exists()).toBe(false);
  });

  it('renders groups into rows according to maxColumns', () => {
    const groups = [
      createGroup({ id: 1, name: 'G1', memberCount: 10 }),
      createGroup({ id: 2, name: 'G2', memberCount: 20 }),
      createGroup({ id: 3, name: 'G3', memberCount: 30 }),
      createGroup({ id: 4, name: 'G4', memberCount: 40 }),
      createGroup({ id: 5, name: 'G5', memberCount: 50 }),
    ];
    const wrapper = mountWithStore({ groups, maxColumns: 3 });

    const rows = wrapper.findAll(SELECTOR.row);
    expect(rows).toHaveLength(2);
    expect(rows[0].findAll(SELECTOR.option)).toHaveLength(3);
    expect(rows[1].findAll(SELECTOR.option)).toHaveLength(2);
  });

  it('emits update:selected-groups when toggling a non-selected group', async () => {
    const g1 = createGroup({ id: 1, name: 'G1' });
    const wrapper = mountWithStore({ groups: [g1], selectedGroups: [] });
    await wrapper.find(SELECTOR.option).trigger('click');
    const selected = getFirstSelected(wrapper);
    expect(selected.map((g) => g.id)).toEqual([1]);
  });

  it('emits update:selected-groups removing an already selected group', async () => {
    const g2 = createGroup({ id: 2, name: 'G2' });
    const wrapper = mountWithStore({ groups: [g2], selectedGroups: [g2] });
    await wrapper.find(SELECTOR.option).trigger('click');
    expect(getFirstSelected(wrapper)).toEqual([]);
  });

  it('forwards page changes from footer', async () => {
    const groups = [createGroup({ id: 1 })];
    const wrapper = mountWithStore({ groups, page: 1, pageSize: 5, total: 10 });
    await wrapper.find(SELECTOR.nextPage).trigger('click');
    expect(wrapper.emitted('update:page')).toEqual([[2]]);
  });

  it('shows empty component when not loading and no groups', () => {
    const wrapper = mountWithStore({ groups: [], loading: false });
    expect(wrapper.find(SELECTOR.empty).exists()).toBe(true);
  });
});
