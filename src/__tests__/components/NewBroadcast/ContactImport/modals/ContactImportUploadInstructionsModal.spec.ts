import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactImportUploadInstructionsModal from '@/components/NewBroadcast/ContactImport/modals/ContactImportUploadInstructionsModal.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const STUBS = {
  UnnnicModalDialog: {
    props: [
      'modelValue',
      'title',
      'size',
      'showCloseIcon',
      'showActionsDivider',
    ],
    emits: ['update:model-value'],
    template:
      '<div data-test="modal" :data-open="modelValue"><slot /><button data-test="close" @click="$emit(\'update:model-value\', false)">close</button></div>',
  },
  UnnnicDataTable: {
    props: ['headers', 'items', 'fixedHeaders', 'hidePagination'],
    template:
      '<table data-test="table"><thead><tr><th v-for="h in headers" :key="h.title">{{ h.title }}</th></tr></thead><tbody><tr v-for="(it, i) in items" :key="i"><td>{{ it.column_header }}</td><td>{{ it.description }}</td><td>{{ it.example }}</td></tr></tbody></table>',
  },
  I18nT: {
    props: ['keypath', 'tag'],
    template: '<span data-test="i18nt"><slot /></span>',
  },
} as const;

const mountWrapper = (open = true) =>
  mount(ContactImportUploadInstructionsModal, {
    props: { open },
    global: { stubs: STUBS, mocks: { $t: (key: string) => key } },
  });

const SELECTOR = {
  subtitle1: '[data-test="subtitle-1"]',
  subtitle2: '[data-test="subtitle-2"]',
  instructionsItem: '[data-test="instructions-item"]',
  tableHeadCells: 'thead th',
  tableBodyRows: 'tbody tr',
  close: '[data-test="close"]',
  downloadSample: '[data-test="download-sample"]',
} as const;

describe('ContactImportUploadInstructionsModal.vue', () => {
  it('renders subtitle, list items and table headers/items', () => {
    const wrapper = mountWrapper(true);
    // subtitles
    expect(wrapper.find(SELECTOR.subtitle1).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.subtitle2).exists()).toBe(true);
    // list items (5)
    const listItems = wrapper.findAll(SELECTOR.instructionsItem);
    expect(listItems.length).toBeGreaterThanOrEqual(5);
    // table headers
    const headerCells = wrapper.findAll(SELECTOR.tableHeadCells);
    expect(headerCells.map((h) => h.text())).toEqual([
      'modals.contact_import_upload_instructions.table.header_1',
      'modals.contact_import_upload_instructions.table.header_2',
      'modals.contact_import_upload_instructions.table.header_3',
    ]);
    // at least 3 rows present
    expect(
      wrapper.findAll(SELECTOR.tableBodyRows).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('emits update:open=false when modal close is triggered', async () => {
    const wrapper = mountWrapper(true);
    await wrapper.find(SELECTOR.close).trigger('click');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('calls download sample handler when footer highlight is clicked', async () => {
    const windowOpenSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => null);
    const wrapper = mountWrapper(true);
    await wrapper.find(SELECTOR.downloadSample).trigger('click');
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://flows.weni.ai/sitestatic/examples/sample_import.xlsx',
      '_blank',
    );
    windowOpenSpy.mockRestore();
  });
});
