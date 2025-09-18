<template>
  <section class="contact-import-processing-mapping">
    <h1 class="contact-import-processing-mapping__title">
      {{ $t('new_broadcast.pages.contact_import.processing.mapping.title') }}
    </h1>

    <UnnnicDataTable
      v-model:page="page"
      class="contact-import-processing-mapping__table"
      :headers="headers"
      :items="tableRows"
      fixedHeaders
      :hidePagination="true"
    >
      <template #header-selected>
        <UnnnicCheckbox
          size="ant"
          :modelValue="selectAll"
          :disabled="disabledSelectAll"
          @update:model-value="handleSelectAll"
        />
      </template>

      <template #body-selected="{ item }">
        <UnnnicCheckbox
          :modelValue="item.selected"
          :disabled="disabledItemSelection(item)"
          size="ant"
          @update:model-value="() => handleSelect(item)"
        />
      </template>

      <template #body-type="{ item }">
        <p v-if="item.columnType !== ContactImportColumnType.NEW_FIELD">
          {{ itemTypeLabel(item.type) }}
        </p>
        <UnnnicSelectSmart
          v-else
          :options="fieldTypeOptions"
          :modelValue="getFieldTypeOption(item)"
          size="sm"
          @update:model-value="
            (event: SelectOption<ContactFieldType>[]) =>
              handleFieldTypeUpdate(item, event)
          "
        />
      </template>
    </UnnnicDataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { useContactImportStore } from '@/stores/contactImport';
import {
  ContactImportColumnType,
  type ContactImportColumn,
  type ContactImportColumnsData,
} from '@/types/contactImport';
import { ContactFieldType } from '@/types/contacts';
import type { SelectOption } from '@/types/select';
import { useI18n } from 'vue-i18n';
import { getEnumKeyByValue } from '@/utils/enum';

const { t } = useI18n();

const contactImportStore = useContactImportStore();
const defaultTypes = [
  ContactImportColumnType.URN,
  ContactImportColumnType.ATTRIBUTE,
];

interface Row {
  selected: boolean;
  columnHeader: string;
  mapToField?: string;
  sample: string;
  type: ContactFieldType;
  mandatory: boolean;
  columnType: ContactImportColumnType;
}

const page = ref(1);
const headers = [
  {
    title: '',
    itemKey: 'selected',
    size: '52px',
  },
  {
    title: 'Column',
    itemKey: 'columnHeader',
  },
  {
    title: 'Map to field',
    itemKey: 'mapToField',
  },
  {
    title: 'Sample',
    itemKey: 'sample',
  },
  {
    title: 'Type',
    itemKey: 'type',
  },
];

const fieldTypeOptions = [
  {
    label: 'Text',
    value: ContactFieldType.TEXT,
  },
  {
    label: 'Number',
    value: ContactFieldType.NUMBER,
  },

  {
    label: 'Date',
    value: ContactFieldType.DATE,
  },
];

const tableRows = ref<Row[]>([]);
const selectAll: Ref<false | 'less'> = ref('less');

const disabledSelectAll = computed(() => {
  return tableRows.value.every(disabledItemSelection);
});

onMounted(() => {
  tableRows.value = initTableRows();
});

watch(
  () => tableRows.value,
  () => {
    const data = {} as ContactImportColumnsData;
    tableRows.value.forEach((row, index) => {
      data[`column_${index}_include`] = row.selected;
      data[`column_${index}_name`] = row.mapToField;
      data[`column_${index}_value_type`] = row.type;
    });
    contactImportStore.setProcessingColumnsData(data);
  },
  { deep: true },
);

const initTableRows = () => {
  return (
    contactImportStore.import?.columns.map((column) => {
      const mandatory = isMandatory(column);

      const fieldType = columnFieldType(column);

      return {
        selected: true,
        columnHeader: column.header,
        mapToField: getMapToField(column),
        sample: 'find sample', // TODO: get sample from API when ready
        type: fieldType,
        mandatory: mandatory,
        columnType: column.type,
      };
    }) ?? []
  );
};

const isMandatory = (column: ContactImportColumn) => {
  return defaultTypes.includes(column.type);
};

const disabledItemSelection = (item: Row) => {
  return (
    item.mandatory || item.columnType !== ContactImportColumnType.NEW_FIELD
  );
};

const columnFieldType = (column: ContactImportColumn): ContactFieldType => {
  return (
    fieldTypeMap.value?.[column.matchedField ?? ''] ||
    column.suggestedType ||
    ContactFieldType.TEXT
  );
};

const getMapToField = (column: ContactImportColumn) => {
  if (column.matchedField) {
    return column.matchedField;
  }

  if (column.type === ContactImportColumnType.URN) {
    const urn = column.header.split(':')[1];
    return `${urn} URN`;
  }

  if (column.type === ContactImportColumnType.NEW_FIELD) {
    const fieldKey = column.header.split(':')[1];
    return fieldKey;
  }
};

const fieldTypeMap = computed(() => {
  return contactImportStore.import?.fields.reduce(
    (acc, field) => {
      acc[field.key] = field.type;
      return acc;
    },
    {} as Record<string, ContactFieldType>,
  );
});

const itemTypeLabel = (type: ContactFieldType): string => {
  const key = getEnumKeyByValue(ContactFieldType, type);
  return t(`new_broadcast.pages.contact_import.processing.mapping.type.${key}`);
};

const handleSelectAll = () => {
  selectAll.value = selectAll.value === 'less' ? false : 'less';

  const selectAllToBoolean = selectAll.value === 'less' ? true : false;
  updateAllRowsSelection(selectAllToBoolean);
};

const updateAllRowsSelection = (selected: boolean) => {
  tableRows.value.forEach((row) => {
    if (!disabledItemSelection(row)) {
      row.selected = selected;
    }
  });
};

const handleSelect = (item: Row) => {
  item.selected = !item.selected;
};

const handleFieldTypeUpdate = (
  item: Row,
  options: SelectOption<ContactFieldType>[],
) => {
  item.type = options[0].value;
};

const getFieldTypeOption = (item: Row): SelectOption<ContactFieldType>[] => {
  const option = fieldTypeOptions.find((option) => option.value === item.type);
  return [option!];
};
</script>

<style lang="scss" scoped>
.contact-import-processing-mapping {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__table {
    overflow: unset;
  }

  &__table:deep(.unnnic-data-table__header-cell) {
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;
  }

  // Unsetting overflows to fix select dropdown to be properly displayed
  &__table:deep(.unnnic-data-table__body-row) {
    overflow: unset;

    .unnnic-data-table__body-cell:last-child {
      overflow: unset;
    }
  }
}
</style>
