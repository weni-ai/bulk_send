<template>
  <UnnnicCollapse
    class="group-selection"
    :modelValue="open"
    @update:model-value="handleCollapseUpdate"
  >
    <template #header>
      <h1 class="group-selection__title">
        {{ $t('new_broadcast.pages.select_groups.select_contact_groups') }}
      </h1>
    </template>
    <section class="group-selection__content">
      <GroupSelectionOverview
        v-show="selectedGroups.length > 0"
        :selectedGroups="selectedGroups"
        @remove="handleSelectedGroupsUpdate([])"
      />
      <GroupSelectionFilters
        :search="search"
        :sort="sort"
        @update:search="handleSearchUpdate"
        @update:sort="handleSortUpdate"
      />
      <GroupSelectionList
        class="group-selection__list"
        :maxColumns="3"
        :page="groupsPage"
        :pageSize="groupsPageSize"
        :total="groupsTotal"
        :loading="loadingGroups"
        :selectedGroups="selectedGroups"
        @update:page="handlePageUpdate"
        @update:selected-groups="handleSelectedGroupsUpdate"
        @reset="handleReset"
      />
    </section>
  </UnnnicCollapse>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useGroupsStore } from '@/stores/groups';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import GroupSelectionOverview from '@/components/NewBroadcast/GroupSelection/GroupSelectionOverview.vue';
import GroupSelectionFilters from '@/components/NewBroadcast/GroupSelection/GroupSelectionFilters.vue';
import GroupSelectionList from '@/components/NewBroadcast/GroupSelection/GroupSelectionList.vue';
import { PAGE_SIZE, SORT_OPTIONS } from '@/constants/groups';
import type { Group } from '@/types/groups';

const groupsStore = useGroupsStore();
const projectStore = useProjectStore();
const broadcastsStore = useBroadcastsStore();

defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['update:open']);

onBeforeMount(() => {
  fetchGroups();
});

const search = ref('');
const sort = ref(SORT_OPTIONS.ASC);
const groupsPage = ref(1);
const groupsPageSize = PAGE_SIZE;
const groupsTotal = computed(() => groupsStore.groupsCount);
const selectedGroups = computed(
  () => broadcastsStore.newBroadcast.selectedGroups,
);
const loadingGroups = computed(() => {
  return groupsStore.loadingGroups;
});

watch(
  [search, sort, groupsPage],
  useDebounceFn(() => {
    fetchGroups();
  }, 400),
);

const handleCollapseUpdate = (value: boolean) => {
  emit('update:open', value);
};

const handlePageUpdate = (newPage: number) => {
  groupsPage.value = newPage;
};

const handleSearchUpdate = (value: string) => {
  groupsPage.value = 1;
  search.value = value;
};

const handleSortUpdate = (value: string) => {
  groupsPage.value = 1;
  sort.value = value;
};

const handleReset = () => {
  groupsPage.value = 1;
  search.value = '';
  sort.value = SORT_OPTIONS.ASC;
};

const fetchGroups = () => {
  const order = sort.value === SORT_OPTIONS.ASC ? 'name' : '-name';

  const params = {
    limit: PAGE_SIZE,
    offset: (groupsPage.value - 1) * PAGE_SIZE,
    name: search.value,
    order,
  };

  groupsStore.getGroups(projectStore.project.uuid, params);
};

const handleSelectedGroupsUpdate = (groups: Group[]) => {
  broadcastsStore.setSelectedGroups(groups);
};
</script>

<style scoped lang="scss">
.group-selection {
  padding: unset;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }
}
</style>
