import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TemplateSelection from '@/components/NewBroadcast/TemplateSelection/TemplateSelection.vue';
import { useTemplatesStore } from '@/stores/templates';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';
import { PAGE_SIZE, TemplateStatus } from '@/constants/templates';

// i18n stub
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

// mock debounce to run immediately
vi.mock('@vueuse/core', () => ({ useDebounceFn: (fn: any) => fn }));

const SELECTOR = {
  filtersSetSearch: '[data-test="set-search"]',
  filtersSetChannel: '[data-test="set-channel"]',
  filtersClearChannel: '[data-test="clear-channel"]',
  listNext: '[data-test="next"]',
  listSortAsc: '[data-test="sort-asc"]',
  listSortDesc: '[data-test="sort-desc"]',
  actionsCancel: '[data-test="actions-cancel"]',
  actionsContinue: '[data-test="actions-continue"]',
} as const;

const stubs = {
  UnnnicDisclaimer: { template: '<div data-test="disclaimer" />' },
  TemplateSelectionPreview: { template: '<div data-test="preview" />' },
  TemplateSelectionFilters: {
    props: ['search', 'channel'],
    emits: ['update:search', 'update:channel'],
    template:
      '<div data-test="filters">\n' +
      '  <button data-test="set-search" @click="$emit(\'update:search\', \'hello\')">set search</button>\n' +
      "  <button data-test=\"set-channel\" @click=\"$emit('update:channel', { uuid: 'ch-1', name: 'WAC 1', channel_type: 'WAC' })\">set channel</button>\n" +
      '  <button data-test="clear-channel" @click="$emit(\'update:channel\', undefined)">clear channel</button>\n' +
      '</div>',
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
  StepActions: {
    props: ['disabled'],
    emits: ['cancel', 'continue'],
    template:
      '<div data-test="actions"><button data-test="actions-cancel" @click="$emit(\'cancel\')">cancel</button><button data-test="actions-continue" :disabled="disabled" @click="$emit(\'continue\')">continue</button></div>',
  },
} as const;

const mountWithStore = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const templatesStore = useTemplatesStore(pinia);
  const fetchSpy = vi
    .spyOn(templatesStore, 'fetchTemplates')
    .mockResolvedValue(undefined as any);
  const broadcastsStore = useBroadcastsStore(pinia);

  const wrapper = mount(TemplateSelection, {
    global: { plugins: [pinia], stubs, mocks: { $t: (k: string) => k } },
  });

  return { wrapper, templatesStore, fetchSpy, broadcastsStore };
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
      order_by: 'date',
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
      order_by: 'date',
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
      order_by: 'date',
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

  it('updates channel filter and fetches with channel uuid', async () => {
    const { wrapper, fetchSpy } = mountWithStore();
    fetchSpy.mockClear();

    await wrapper.find(SELECTOR.filtersSetChannel).trigger('click');
    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: 0,
      name: '',
      order_by: 'date',
      channel: 'ch-1',
    });
  });

  it('clears channel filter and fetches without channel param', async () => {
    const { wrapper, fetchSpy } = mountWithStore();
    fetchSpy.mockClear();

    // set then clear
    await wrapper.find(SELECTOR.filtersSetChannel).trigger('click');
    fetchSpy.mockClear();
    await wrapper.find(SELECTOR.filtersClearChannel).trigger('click');

    expect(fetchSpy).toHaveBeenCalledWith({
      limit: PAGE_SIZE,
      offset: 0,
      name: '',
      order_by: 'date',
      channel: undefined,
    });
  });

  it('disables continue when template not approved; enables when approved', async () => {
    const { wrapper, broadcastsStore } = mountWithStore();

    // not approved -> disabled
    broadcastsStore.setSelectedTemplate({
      status: TemplateStatus.PENDING,
    } as any);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeDefined();

    // approved -> enabled
    broadcastsStore.setSelectedTemplate({
      status: TemplateStatus.APPROVED,
    } as any);
    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(SELECTOR.actionsContinue).attributes('disabled'),
    ).toBeUndefined();
  });

  it('cancel clears selected template and returns to groups page', async () => {
    const { wrapper, broadcastsStore } = mountWithStore();
    broadcastsStore.setSelectedTemplate({
      status: TemplateStatus.APPROVED,
    } as any);
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    await wrapper.find(SELECTOR.actionsCancel).trigger('click');
    expect(broadcastsStore.newBroadcast.selectedTemplate).toBeUndefined();
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_GROUPS);
  });

  it('continue goes to variables when template has variables, else confirm and send', async () => {
    const { wrapper, broadcastsStore } = mountWithStore();
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    broadcastsStore.setSelectedTemplate({
      status: TemplateStatus.APPROVED,
      variableCount: 2,
    } as any);
    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_VARIABLES);

    broadcastsStore.setSelectedTemplate({
      status: TemplateStatus.APPROVED,
      variableCount: 0,
    } as any);
    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.CONFIRM_AND_SEND);
  });

  it('continue goes to variables when header has media even with 0 variables', async () => {
    const { wrapper, broadcastsStore } = mountWithStore();
    const setPageSpy = vi
      .spyOn(broadcastsStore, 'setNewBroadcastPage')
      .mockImplementation(() => {});

    broadcastsStore.setSelectedTemplate({
      status: TemplateStatus.APPROVED,
      variableCount: 0,
      header: { type: 'IMAGE' },
    } as any);
    await wrapper.vm.$nextTick();
    await wrapper.find(SELECTOR.actionsContinue).trigger('click');
    expect(setPageSpy).toHaveBeenCalledWith(NewBroadcastPage.SELECT_VARIABLES);
  });
});
