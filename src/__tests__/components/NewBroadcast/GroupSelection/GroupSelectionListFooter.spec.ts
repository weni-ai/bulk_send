import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useGroupsStore } from '@/stores/groups';
import GroupSelectionListFooter from '@/components/NewBroadcast/GroupSelection/GroupSelectionListFooter.vue';

const SELECTOR = {
  root: '[data-test="footer"]',
  text: '[data-test="pagination-text"]',
  pagination: '[data-test="pagination"]',
} as const;

const stubs = {
  UnnnicPagination: {
    props: ['max', 'modelValue'],
    emits: ['update:model-value'],
    template:
      '<div data-test="pagination" :data-max="max" :data-page="modelValue" @click="$emit(\'update:model-value\', (modelValue || 1) + 1)">Pagination</div>',
  },
};

const mountWithStore = (options: {
  page: number;
  pageSize: number;
  total: number;
  groupsLength: number;
}) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const groupsStore = useGroupsStore(pinia);
  groupsStore.groups = Array.from({ length: options.groupsLength }).map(
    (_, i) => ({
      id: i + 1,
      uuid: `uuid-${i + 1}`,
      name: `Group ${i + 1}`,
      memberCount: 10,
    }),
  );

  const wrapper = mount(GroupSelectionListFooter, {
    props: {
      page: options.page,
      pageSize: options.pageSize,
      total: options.total,
    },
    global: {
      plugins: [pinia],
      stubs,
      mocks: {
        $t: (_key: string, params?: Record<string, unknown>) =>
          `Pagination: ${params?.currentPageOffset}/${params?.total}`,
      },
    },
  });

  return wrapper;
};

describe('GroupSelectionListFooter.vue', () => {
  it('renders footer with correct text and pagination props when groups exist', () => {
    const wrapper = mountWithStore({
      page: 2,
      pageSize: 5,
      total: 14,
      groupsLength: 3,
    });

    // Footer visible
    expect(wrapper.find(SELECTOR.root).exists()).toBe(true);

    // currentPageOffset = min((page-1)*pageSize + groupsLength, total) = min(5 + 3, 14) = 8
    expect(wrapper.find(SELECTOR.text).text()).toContain('8/14');

    // Pagination receives max pages and current page
    const pagination = wrapper.find(SELECTOR.pagination);
    expect(Number(pagination.attributes('data-max'))).toBe(3); // ceil(14/5)
    expect(Number(pagination.attributes('data-page'))).toBe(2);
  });

  it('emits update:page when pagination changes page', async () => {
    const wrapper = mountWithStore({
      page: 1,
      pageSize: 5,
      total: 10,
      groupsLength: 5,
    });
    await wrapper.find(SELECTOR.pagination).trigger('click');
    expect(wrapper.emitted('update:page')).toEqual([[2]]);
  });

  it('does not render footer when no groups are present', () => {
    const wrapper = mountWithStore({
      page: 1,
      pageSize: 5,
      total: 10,
      groupsLength: 0,
    });
    expect(wrapper.find(SELECTOR.root).exists()).toBe(false);
  });
});
