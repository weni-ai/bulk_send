<template>
  <section class="template-selection">
    <h1 class="template-selection__title">
      {{ $t('new_broadcast.pages.select_template.page_title') }}
    </h1>

    <UnnnicDisclaimer
      class="template-selection__disclaimer"
      icon="alert-circle-1-1"
      scheme="neutral-dark"
      :text="$t('new_broadcast.pages.select_template.disclaimer')"
    />

    <section class="template-selection__content">
      <section class="template-selection__templates">
        <TemplateSelectionFilters
          class="template-selection__templates-filters"
          :search="search"
          @update:search="handleSearchUpdate"
        />

        <TemplateSelectionList
          :page="page"
          :pageSize="PAGE_SIZE"
          :total="templatesTotal"
          class="template-selection__templates-list"
          @update:page="handlePageUpdate"
          @update:sort="handleSortUpdate"
        />
      </section>

      <TemplateSelectionPreview class="template-selection__preview" />
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { PAGE_SIZE } from '@/constants/templates';
import { useTemplatesStore } from '@/stores/templates';
import TemplateSelectionFilters from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionFilters.vue';
import TemplateSelectionList from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionList.vue';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';

const templatesStore = useTemplatesStore();

const search = ref('');
const page = ref(1);
const sort = ref('name');

onBeforeMount(() => {
  fetchTemplates();
});

watch(
  [search, sort],
  useDebounceFn(() => {
    fetchTemplates();
  }, 300),
);

watch([page], () => {
  fetchTemplates();
});

const templatesTotal = computed(() => templatesStore.templatesCount);

const fetchTemplates = () => {
  const params = {
    limit: PAGE_SIZE,
    offset: (page.value - 1) * PAGE_SIZE,
    name: search.value,
    order_by: sort.value,
  };

  templatesStore.fetchTemplates(params);
};

const handleSearchUpdate = (value: string) => {
  page.value = 1;
  search.value = value;
};

const handlePageUpdate = (value: number) => {
  page.value = value;
};

const handleSortUpdate = (newSort: { header: string; order: string }) => {
  page.value = 1;

  const prefix = newSort.order === 'asc' ? '' : '-';

  sort.value = `${prefix}${newSort.header}`;
};
</script>

<style scoped lang="scss">
.template-selection {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__content {
    display: flex;
    gap: $unnnic-spacing-sm;
  }

  &__templates {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-ant;
  }

  &__disclaimer {
    :deep(.highlight) {
      @include disclaimer-highlight;
    }
  }
}
</style>
