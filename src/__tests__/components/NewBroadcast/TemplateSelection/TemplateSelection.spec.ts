import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TemplateSelection from '@/components/NewBroadcast/TemplateSelection/TemplateSelection.vue';
import { useTemplatesStore } from '@/stores/templates';
import { PAGE_SIZE } from '@/constants/templates';

// i18n stub
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

// mock debounce to run immediately
vi.mock('@vueuse/core', () => ({ useDebounceFn: (fn: any) => fn }));

const SELECTOR = {
  filtersSetSearch: '[data-test="set-search"]',
  listNext: '[data-test="next"]',
  listSortAsc: '[data-test="sort-asc"]',
  listSortDesc: '[data-test="sort-desc"]',
} as const;

const stubs = {
  UnnnicDisclaimer: { template: '<div data-test="disclaimer" />' },
  TemplateSelectionPreview: { template: '<div data-test="preview" />' },
  TemplateSelectionFilters: {
    props: ['search'],
    emits: ['update:search'],
    template:
      '<div data-test="filters"><button data-test="set-search" @click="$emit(\'update:search\', \'hello\')">set search</button></div>',
  },
  TemplateSelectionList: {
    props: ['page', 'pageSize', 'total'],
    emits: ['update:page', 'update:sort'],
    template:
      '<div data-test="list">\n' +
      '  <button data-test="next" @click="$emit(\'update:page\', page + 1)">next</button>\n' +
      "  <button data-test=\"sort-asc\" @click=\"$emit('update:sort', { header: 'name', order: 'asc' })\">asc</button>\n" +
      "  <button data-test=\"sort-desc\" @click=\"$emit('update:sort', { header: 'name', order: 'desc' })\">desc</button>\n" +
      '</div>',
  },
} as const;

const mountWithStore = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const templatesStore = useTemplatesStore(pinia);
  const fetchSpy = vi
    .spyOn(templatesStore, 'fetchTemplates')
    .mockResolvedValue(undefined as any);

  const wrapper = mount(TemplateSelection, {
    global: { plugins: [pinia], stubs, mocks: { $t: (k: string) => k } },
  });

  return { wrapper, templatesStore, fetchSpy };
};

describe('TemplateSelection.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches templates on mount with default params', () => {
    const { fetchSpy } = mountWithStore();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: 0,
      name: '',
      order_by: 'name',
    });
  });

  it('updates page and fetches templates with correct offset', async () => {
    const { wrapper, fetchSpy } = mountWithStore();
    fetchSpy.mockClear();
    await wrapper.find(SELECTOR.listNext).trigger('click');
    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: PAGE_SIZE * (2 - 1),
      name: '',
      order_by: 'name',
    });
  });

  it('updates search, resets page to 1, and fetches', async () => {
    const { wrapper, fetchSpy } = mountWithStore();
    // move to page 2 first
    await wrapper.find(SELECTOR.listNext).trigger('click');
    fetchSpy.mockClear();

    await wrapper.find(SELECTOR.filtersSetSearch).trigger('click');
    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: 0, // reset to page 1
      name: 'hello',
      order_by: 'name',
    });
  });

  it('updates sort asc/desc, resets page to 1, and fetches with correct order_by', async () => {
    const { wrapper, fetchSpy } = mountWithStore();
    fetchSpy.mockClear();

    fetchSpy.mockClear();
    await wrapper.find(SELECTOR.listSortDesc).trigger('click');
    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: 0,
      name: '',
      order_by: '-name',
    });

    await wrapper.find(SELECTOR.listSortAsc).trigger('click');
    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: 0,
      name: '',
      order_by: 'name',
    });
  });
});
