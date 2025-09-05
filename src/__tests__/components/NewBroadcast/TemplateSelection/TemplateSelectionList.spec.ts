import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TemplateSelectionList from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionList.vue';
import { useTemplatesStore } from '@/stores/templates';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { TemplateStatus } from '@/constants/templates';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

// Mock templates API to avoid useProjectStore at import time
vi.mock('@/api/resources/templates', () => ({
  default: {
    getTemplates: vi.fn(),
    getTemplate: vi.fn(),
  },
}));

const STUBS = {
  UnnnicDataTable: {
    props: [
      'headers',
      'items',
      'isLoading',
      'page',
      'pageTotal',
      'pageInterval',
      'size',
      'fixedHeaders',
      'clickable',
    ],
    emits: ['update:page', 'item-click', 'update:sort'],
    template:
      '<div data-test="table">\n' +
      '  <div data-test="rows">\n' +
      '    <div v-for="(it, i) in items" :key="i" data-test="row" @click="$emit(\'item-click\', it)">\n' +
      '      <slot :name="\'body-name\'" :item="it" />\n' +
      '      <slot :name="\'body-created_on\'" :item="it" />\n' +
      '      <slot :name="\'body-content\'" :item="it" />\n' +
      '      <slot :name="\'body-status\'" :item="it" />\n' +
      '    </div>\n' +
      '  </div>\n' +
      '  <button data-test="next" @click="$emit(\'update:page\', page + 1)">next</button>\n' +
      '  <button data-test="sort-name-asc" @click="$emit(\'update:sort\', { header: headers[0].title, order: \'Asc\' })">sort name asc</button>\n' +
      '</div>',
  },
  TemplateSelectionListRow: {
    props: ['selected', 'value'],
    template:
      '<div data-test="list-row" :data-selected="selected"><span data-test="value">{{ value }}</span><slot name="value" /></div>',
  },
  UnnnicIcon: {
    props: ['icon', 'scheme', 'size'],
    template:
      '<i data-test="icon" :data-icon="icon" :data-scheme="scheme" :data-size="size" />',
  },
};

const SELECTOR = {
  table: '[data-test="table"]',
  rows: '[data-test="row"]',
  next: '[data-test="next"]',
  sortNameAsc: '[data-test="sort-name-asc"]',
  listRow: '[data-test="list-row"]',
  value: '[data-test="value"]',
  icon: '[data-test="icon"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const templatesStore = useTemplatesStore(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);

  // seed templates
  templatesStore.templates = [
    {
      uuid: 't1',
      name: 'Welcome',
      createdOn: '2024-01-10T00:00:00Z',
      category: 'CAT',
      language: 'en',
      body: { text: 'Hello' },
      status: TemplateStatus.APPROVED,
    } as any,
    {
      uuid: 't2',
      name: 'Pending',
      createdOn: '2024-02-15T00:00:00Z',
      category: 'CAT',
      language: 'en',
      body: { text: 'Pending Body' },
      status: TemplateStatus.PENDING,
    } as any,
  ];

  const wrapper = mount(TemplateSelectionList, {
    props: { page: 1, pageSize: 5, total: 2 },
    global: { plugins: [pinia], stubs: STUBS },
  });

  return { wrapper, templatesStore, broadcastsStore };
};

describe('TemplateSelectionList.vue', () => {
  it('renders rows via dynamic body slots and shows values', () => {
    const { wrapper } = mountWrapper();
    const rows = wrapper.findAll(SELECTOR.rows);
    expect(rows.length).toBe(2);

    const values = wrapper.findAll(SELECTOR.value).map((n) => n.text());
    // name, date, content per row in order
    expect(values).toContain('Welcome');
    expect(values).toContain('Pending');
    // content shows body text
    expect(values).toContain('Hello');
    expect(values).toContain('Pending Body');
  });

  it('clicking a row selects the template in broadcasts store', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    const rows = wrapper.findAll(SELECTOR.rows);
    await rows[1].trigger('click');
    expect(broadcastsStore.newBroadcast.selectedTemplate?.uuid).toBe('t2');
  });

  it('emits pagination and sort events', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.find(SELECTOR.next).trigger('click');
    expect(wrapper.emitted('update:page')?.[0]).toEqual([2]);

    await wrapper.find(SELECTOR.sortNameAsc).trigger('click');
    expect(wrapper.emitted('update:sort')?.[0]).toEqual([
      { header: 'name', order: 'Asc' },
    ]);
  });

  it('renders status cell with correct icon scheme and label', () => {
    const { wrapper } = mountWrapper();
    const icons = wrapper.findAll(SELECTOR.icon);
    // First row APPROVED => check_circle / aux-green-500
    expect(icons[0].attributes('data-icon')).toBe('check_circle');
    expect(icons[0].attributes('data-scheme')).toBe('aux-green-500');
    // Second row PENDING => change_circle / aux-yellow-500
    expect(icons[1].attributes('data-icon')).toBe('change_circle');
    expect(icons[1].attributes('data-scheme')).toBe('aux-yellow-500');
  });
});
