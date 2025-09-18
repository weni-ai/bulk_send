<template>
  <section class="template-selection">
    <section class="template-selection__main">
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
            :channel="channel"
            @update:search="handleSearchUpdate"
            @update:channel="handleChannelUpdate"
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
    <footer class="template-selection__footer">
      <StepActions
        :disabled="!canContinue"
        :cancelText="$t('new_broadcast.pages.select_template.actions.cancel')"
        @cancel="handleCancel"
        @continue="handleContinue"
      />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { PAGE_SIZE } from '@/constants/templates';
import { useTemplatesStore } from '@/stores/templates';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';
import TemplateSelectionFilters from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionFilters.vue';
import TemplateSelectionList from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionList.vue';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import StepActions from '@/components/NewBroadcast/StepActions.vue';
import { TemplateStatus } from '@/constants/templates';
import type { Channel } from '@/types/channel';

const templatesStore = useTemplatesStore();
const broadcastsStore = useBroadcastsStore();

const search = ref('');
const page = ref(1);
const sort = ref('name');
const channel = ref<Channel | undefined>(undefined);

onBeforeMount(() => {
  fetchTemplates();
});

watch(
  [search, sort, channel],
  useDebounceFn(() => {
    fetchTemplates();
  }, 300),
);

watch([page], () => {
  fetchTemplates();
});

const templatesTotal = computed(() => templatesStore.templatesCount);

const isApproved = () =>
  broadcastsStore.newBroadcast.selectedTemplate &&
  broadcastsStore.newBroadcast.selectedTemplate.status ===
    TemplateStatus.APPROVED;

const canContinue = computed(() => !!isApproved());

const handleCancel = () => {
  broadcastsStore.setSelectedTemplate(undefined);
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
};

const shouldGoToVariablesPage = computed(() => {
  const selectedTemplate = broadcastsStore.newBroadcast.selectedTemplate;
  const hasVariables =
    selectedTemplate?.variableCount && selectedTemplate.variableCount > 0;

  const hasMediaHeader =
    selectedTemplate?.header?.type && selectedTemplate?.header?.type !== 'TEXT';
  return hasVariables || hasMediaHeader;
});

const handleContinue = () => {
  if (shouldGoToVariablesPage.value) {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_VARIABLES);
  } else {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.CONFIRM_AND_SEND);
  }
};

const fetchTemplates = () => {
  const params = {
    limit: PAGE_SIZE,
    offset: (page.value - 1) * PAGE_SIZE,
    name: search.value,
    order_by: sort.value,
    channel: channel.value?.uuid,
  };

  templatesStore.fetchTemplates(params);
};

const handleSearchUpdate = (value: string) => {
  page.value = 1;
  search.value = value;
};

const handleChannelUpdate = (value: Channel | undefined) => {
  page.value = 1;
  channel.value = value;
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
  flex: 1;
  overflow: auto;

  &__main {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    flex: 1;
    overflow: auto;
  }

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__content {
    display: grid;
    grid-template-columns: 8fr 4fr;
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
