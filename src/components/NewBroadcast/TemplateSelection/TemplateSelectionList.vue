<template>
  <section class="template-selection-list">
    <UnnnicDataTable
      :class="{
        'template-selection-list__table': true,
        'template-selection-list__table--loading': loadingTemplates,
      }"
      :headers="headers"
      :items="tableRows"
      :isLoading="loadingTemplates"
      :page="page"
      :pageTotal="total"
      :pageInterval="pageSize"
      size="sm"
      fixedHeaders
      clickable
      @update:page="handlePageUpdate"
      @item-click="handleRowClick"
      @update:sort="handleSortUpdate"
    >
      <template
        v-for="col in bodyColumns"
        :key="col.key"
        #[`body-${col.key}`]="{ item }"
      >
        <TemplateSelectionListRow
          :selected="isSelected(item)"
          :value="col.value(item)"
        />
      </template>
      <template #body-status="{ item }">
        <TemplateSelectionListRow :selected="isSelected(item)">
          <template #value>
            <section class="template-selection-list__row-status">
              <UnnnicIcon
                :icon="itemStatusIcon(item.status)"
                :scheme="itemStatusScheme(item.status)"
                size="ant"
              />
              {{ itemStatusLabel(item.status) }}
            </section>
          </template>
        </TemplateSelectionListRow>
      </template>
    </UnnnicDataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { format } from 'date-fns';
import { useTemplatesStore } from '@/stores/templates';
import { useBroadcastsStore } from '@/stores/broadcasts';
import TemplateSelectionListRow from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionListRow.vue';
import { TemplateStatus } from '@/constants/templates';
import { getEnumKeyByValue } from '@/utils/enum';

const { t } = useI18n();
const templatesStore = useTemplatesStore();
const broadcastsStore = useBroadcastsStore();

defineProps<{
  page: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits(['update:page', 'update:sort']);

const headers = [
  {
    title: t('new_broadcast.pages.select_template.table.name'),
    itemKey: 'name',
    isSortable: true,
  },
  {
    title: t('new_broadcast.pages.select_template.table.date'),
    itemKey: 'created_on',
    isSortable: true,
  },
  {
    title: t('new_broadcast.pages.select_template.table.content'),
    itemKey: 'content',
  },
  {
    title: t('new_broadcast.pages.select_template.table.status'),
    itemKey: 'status',
  },
];
const selectedTemplate = computed(
  () => broadcastsStore.newBroadcast.selectedTemplate,
);

const bodyColumns: {
  key: keyof TemplateRow;
  value: (item: TemplateRow) => string;
}[] = [
  { key: 'name', value: (item) => item.name },
  { key: 'created_on', value: (item) => itemCreatedOnLabel(item.created_on) },
  { key: 'content', value: (item) => item.content },
];

interface TemplateRow {
  uuid: string;
  name: string;
  created_on: string;
  content: string;
  language: string;
  status: TemplateStatus;
}

const tableRows: ComputedRef<TemplateRow[]> = computed(() => {
  return templatesStore.templates.map((template) => ({
    uuid: template.uuid,
    name: template.name,
    created_on: template.createdOn,
    content: template.body.text,
    language: template.language,
    status: template.status,
  }));
});

const loadingTemplates = computed(() => templatesStore.loadingTemplates);

const handleRowClick = (item: TemplateRow) => {
  // only one template can be selected at a time
  const template = templatesStore.templates.find(
    (template) =>
      template.uuid === item.uuid && template.language === item.language,
  );
  broadcastsStore.setSelectedTemplate(template);
};

const handlePageUpdate = (page: number) => {
  emit('update:page', page);
};

const handleSortUpdate = (sort: { header: string; order: string }) => {
  const header = headers.find((header) => header.title === sort.header);

  if (!header) {
    return;
  }

  emit('update:sort', {
    header: header.itemKey,
    order: sort.order,
  });
};

const itemStatusLabel = (status: TemplateStatus) => {
  const statusKey = getEnumKeyByValue(TemplateStatus, status);
  return t(`new_broadcast.pages.select_template.table.statuses.${statusKey}`);
};

const itemStatusIcon = (status: TemplateStatus) => {
  if (status === TemplateStatus.APPROVED) {
    return 'check_circle';
  } else if (status === TemplateStatus.PENDING) {
    return 'change_circle';
  } else {
    return 'block';
  }
};

const itemStatusScheme = (status: TemplateStatus) => {
  if (status === TemplateStatus.APPROVED) {
    return 'aux-green-500';
  } else if (status === TemplateStatus.PENDING) {
    return 'aux-yellow-500';
  } else {
    return 'aux-red-500';
  }
};

const itemCreatedOnLabel = (created_on: string) => {
  return format(new Date(created_on), 'dd/MM/yyyy');
};

const isSelected = (item: TemplateRow) => {
  return (
    item.uuid === selectedTemplate.value?.uuid &&
    item.language === selectedTemplate.value?.language
  );
};
</script>

<style scoped lang="scss">
.template-selection-list {
  display: flex;
  flex: 1;

  &__table {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__table:deep(.unnnic-data-table__header-cell) {
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;
  }

  &__table:deep(.unnnic-data-table__body-cell) {
    padding: 0 !important;
  }

  &__table:deep(.unnnic-data-table__body-row--loading) {
    display: flex;
    flex: 1;
  }

  &__table--loading:deep(.unnnic-data-table__body) {
    display: flex;
    flex: 1;
  }

  &__table-row {
    margin: $unnnic-spacing-sm;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__row-status {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;
  }
}
</style>
