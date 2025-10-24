import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useGroupsStore } from '@/stores/groups';
import { useProjectStore } from '@/stores/project';
import GroupSelection from '@/components/NewBroadcast/GroupSelection/GroupSelection.vue';
import { PAGE_SIZE } from '@/constants/groups';

const SELECTOR = {
  collapse: '[data-test="collapse"]',
  toggle: '[data-test="toggle"]',
  list: '[data-test="list"]',
  next: '[data-test="next"]',
  select: '[data-test="select"]',
  overview: '[data-test="overview"]',
  setSearch: '[data-test="set-search"]',
  setSort: '[data-test="set-sort"]',
} as const;

const stubs = {
  UnnnicCollapse: {
    props: ['modelValue'],
    emits: ['update:model-value'],
    template:
      '<div data-test="collapse" :data-open="modelValue"><button data-test="toggle" @click="$emit(\'update:model-value\', !modelValue)">toggle</button><slot /></div>',
  },
  GroupSelectionOverview: {
    emits: ['remove'],
    template:
      '<div data-test="overview"><button data-test="overview-remove" @click="$emit(\'remove\')" /></div>',
  },
  GroupSelectionFilters: {
    props: ['search', 'sort'],
    emits: ['update:search', 'update:sort'],
    template:
      '<div data-test="filters"><button data-test="set-search" @click="$emit(\'update:search\', \'abc\')">set search</button><button data-test="set-sort" @click="$emit(\'update:sort\', \'Desc\')">set sort</button></div>',
  },
  GroupSelectionList: {
    props: ['page', 'pageSize', 'total', 'loading', 'selectedGroups'],
    emits: ['update:page', 'update:selected-groups'],
    template:
      '<div data-test="list" :data-page="page" :data-total="total" :data-selected-count="selectedGroups.length"><button data-test="next" @click="$emit(\'update:page\', page + 1)">next</button><button data-test="select" @click="$emit(\'update:selected-groups\', [{ id: 1, uuid: \'u1\', name: \'G1\', memberCount: 10 }])">select</button></div>',
  },
};

const mountWithStores = (open = true) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const groupsStore = useGroupsStore(pinia);
  const projectStore = useProjectStore(pinia);
  projectStore.project.uuid = 'proj-1';
  groupsStore.groupsCount = 23;
  const getGroupsSpy = vi
    .spyOn(groupsStore, 'getGroups')
    .mockResolvedValue(undefined as unknown as any);

  const wrapper = mount(GroupSelection, {
    props: { open },
    global: {
      plugins: [pinia],
      stubs,
      mocks: { $t: (key: string) => key },
    },
  });

  return { wrapper, groupsStore, projectStore, getGroupsSpy };
};

describe('GroupSelection.vue', () => {
  it('calls getGroups on mount and on search/sort change (debounced)', async () => {
    vi.useFakeTimers();
    const { wrapper, getGroupsSpy } = mountWithStores(true);

    // initial fetch
    expect(getGroupsSpy).toHaveBeenCalledWith('proj-1', {
      limit: PAGE_SIZE,
      offset: 0,
      name: '',
      order: 'name',
    });

    // search change
    await wrapper.find(SELECTOR.setSearch).trigger('click');
    vi.runAllTimers();
    expect(getGroupsSpy).toHaveBeenCalledWith('proj-1', {
      limit: PAGE_SIZE,
      offset: 0,
      name: 'abc',
      order: 'name',
    });

    // sort change
    await wrapper.find(SELECTOR.setSort).trigger('click');
    vi.runAllTimers();
    expect(getGroupsSpy).toHaveBeenCalledWith('proj-1', {
      limit: PAGE_SIZE,
      offset: 0,
      name: 'abc',
      order: '-name',
    });
    vi.useRealTimers();
  });

  it('emits update:open via collapse and reflects page changes in list', async () => {
    const { wrapper } = mountWithStores(true);

    await wrapper.find(SELECTOR.toggle).trigger('click');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);

    // starts at page 1, after click should be page 2
    await wrapper.find(SELECTOR.next).trigger('click');
    expect(wrapper.find(SELECTOR.list).attributes('data-page')).toBe('2');
  });

  it('shows overview only after selecting groups', async () => {
    const { wrapper } = mountWithStores(true);
    // initially hidden by v-show (style display: none)
    expect(wrapper.find(SELECTOR.overview).attributes('style') || '').toContain(
      'display: none',
    );
    await wrapper.find(SELECTOR.select).trigger('click');
    expect(
      wrapper.find(SELECTOR.overview).attributes('style') || '',
    ).not.toContain('display: none');
  });

  it('clears selected groups when overview remove is clicked', async () => {
    const { wrapper } = mountWithStores(true);
    // select one group
    await wrapper.find(SELECTOR.select).trigger('click');
    // click remove in overview
    await wrapper.find('[data-test="overview-remove"]').trigger('click');
    // overview should be hidden again (no selected groups)
    expect(wrapper.find(SELECTOR.overview).attributes('style') || '').toContain(
      'display: none',
    );
    // and list should reflect zero selected count
    expect(wrapper.find(SELECTOR.list).attributes('data-selected-count')).toBe(
      '0',
    );
  });

  it('resets page to 1 when search or sort changes', async () => {
    const { wrapper } = mountWithStores(true);
    // set page to 2
    await wrapper.find(SELECTOR.next).trigger('click');
    expect(wrapper.find(SELECTOR.list).attributes('data-page')).toBe('2');
    // set search
    await wrapper.find(SELECTOR.setSearch).trigger('click');
    expect(wrapper.find(SELECTOR.list).attributes('data-page')).toBe('1');
    // set page to 2
    await wrapper.find(SELECTOR.next).trigger('click');
    expect(wrapper.find(SELECTOR.list).attributes('data-page')).toBe('2');
    // set sort
    await wrapper.find(SELECTOR.setSort).trigger('click');
    expect(wrapper.find(SELECTOR.list).attributes('data-page')).toBe('1');
  });
});
