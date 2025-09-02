import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContactImportProcessingMapping from '@/components/NewBroadcast/ContactImport/ContactImportProcessingMapping.vue';
import { useContactImportStore } from '@/stores/contactImport';
import { ContactImportColumnType } from '@/types/contactImport';
import { ContactFieldType } from '@/types/contacts';

// i18n stub
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  UnnnicDataTable: {
    props: ['headers', 'items', 'fixedHeaders', 'hidePagination', 'page'],
    emits: ['update:page'],
    template:
      '<div data-test="table"><div data-test="select-all"><slot name="header-selected" /></div><div v-for="(it, i) in items" :key="i" data-test="row"><div data-test="cell-selected"><slot name="body-selected" :item="it" /></div><div data-test="cell-type"><slot name="body-type" :item="it" /></div><div data-test="cell-column">{{ it.columnHeader }}</div><div data-test="cell-map-to-field">{{ it.mapToField }}</div></div></div>',
  },
  UnnnicCheckbox: {
    props: ['modelValue', 'disabled', 'size'],
    emits: ['update:model-value'],
    template:
      '<button data-test="checkbox" :data-disabled="disabled" :data-checked="modelValue" @click="$emit(\'update:model-value\', !modelValue)">cb</button>',
  },
  UnnnicSelectSmart: {
    name: 'UnnnicSelectSmart',
    props: ['options', 'modelValue', 'size'],
    emits: ['update:model-value'],
    template: '<div data-test="select"></div>',
  },
} as const;

const SELECTOR = {
  table: '[data-test="table"]',
  row: '[data-test="row"]',
  cellSelected: '[data-test="cell-selected"]',
  cellType: '[data-test="cell-type"]',
  cellColumn: '[data-test="cell-column"]',
  cellMapToField: '[data-test="cell-map-to-field"]',
  checkbox: '[data-test="checkbox"]',
  select: '[data-test="select"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const contactImportStore = useContactImportStore(pinia);

  // seed import data
  const file = new File([''], 'contacts.csv');
  contactImportStore.import = {
    importId: 1,
    numRecords: 3,
    columns: [
      { header: 'tel:phone', type: ContactImportColumnType.URN },
      {
        header: 'name',
        type: ContactImportColumnType.ATTRIBUTE,
        matchedField: 'name',
      },
      {
        header: 'new_field:age',
        type: ContactImportColumnType.NEW_FIELD,
        suggestedType: ContactFieldType.NUMBER,
      },
    ],
    fields: [
      { key: 'name', label: 'Name', type: ContactFieldType.TEXT },
    ] as any,
    errors: [],
    file,
    duplicatedContactsCount: 0,
  } as any;

  const wrapper = mount(ContactImportProcessingMapping, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });

  return { wrapper, contactImportStore };
};

describe('ContactImportProcessingMapping.vue', () => {
  it('renders rows with column header and computed mapToField', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll(SELECTOR.row);
    expect(rows.length).toBe(3);

    const colTexts = rows.map((r) => r.find(SELECTOR.cellColumn).text());
    expect(colTexts).toEqual(['tel:phone', 'name', 'new_field:age']);

    const mapTexts = rows.map((r) => r.find(SELECTOR.cellMapToField).text());
    expect(mapTexts).toEqual(['phone URN', 'name', 'age']);
  });

  it('disables selection for mandatory and non-NEW_FIELD rows', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll(SELECTOR.row);
    const disabledAttrs = rows.map((r) =>
      r.find(SELECTOR.checkbox).attributes('data-disabled'),
    );
    expect(disabledAttrs).toEqual(['true', 'true', 'false']);
  });

  it('updates store columnsData when a row is toggled and type is changed', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll(SELECTOR.row);
    // Toggle selection on the NEW_FIELD row (index 2)
    await rows[2].find(SELECTOR.checkbox).trigger('click');

    expect(
      contactImportStore.importProcessing.columnsData['column_2_include'],
    ).toBe(false);
    expect(
      contactImportStore.importProcessing.columnsData['column_2_name'],
    ).toBe('age');

    // Change type via select component emit
    const select = rows[2].findComponent({ name: 'UnnnicSelectSmart' });
    select.vm.$emit('update:model-value', [
      { label: 'Date', value: ContactFieldType.DATE },
    ]);
    await wrapper.vm.$nextTick();

    expect(
      contactImportStore.importProcessing.columnsData['column_2_value_type'],
    ).toBe(ContactFieldType.DATE);
  });

  it('selectAll toggles only editable rows and updates store', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll(SELECTOR.row);
    // Initially all rows selected
    expect(
      rows.map((r) => r.find(SELECTOR.checkbox).attributes('data-checked')),
    ).toEqual(['true', 'true', 'true']);

    // Click select-all to deselect editable rows (NEW_FIELD only)
    await wrapper
      .find('[data-test="select-all"]')
      .find(SELECTOR.checkbox)
      .trigger('click');
    await wrapper.vm.$nextTick();

    expect(
      rows.map((r) => r.find(SELECTOR.checkbox).attributes('data-checked')),
    ).toEqual(['true', 'true', 'false']);
    expect(
      contactImportStore.importProcessing.columnsData['column_2_include'],
    ).toBe(false);

    // Click select-all again to reselect editable rows
    await wrapper
      .find('[data-test="select-all"]')
      .find(SELECTOR.checkbox)
      .trigger('click');
    await wrapper.vm.$nextTick();

    expect(
      rows.map((r) => r.find(SELECTOR.checkbox).attributes('data-checked')),
    ).toEqual(['true', 'true', 'true']);
    expect(
      contactImportStore.importProcessing.columnsData['column_2_include'],
    ).toBe(true);
  });
});
