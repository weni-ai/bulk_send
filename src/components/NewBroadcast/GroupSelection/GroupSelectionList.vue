<template>
  <section
    class="group-selection-list"
    data-test="group-list"
  >
    <section
      v-if="loading"
      class="group-selection-list__loading"
      data-test="group-list-loading"
    >
      <img
        :src="weniLoading"
        width="40"
        height="40"
      />
    </section>
    <section
      v-if="showGroupsList"
      class="group-selection-list__content"
      data-test="group-list-content"
    >
      <section
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="group-selection-list__row"
        data-test="group-list-row"
      >
        <GroupSelectionOption
          v-for="group in row"
          :key="group.id"
          :title="group.name"
          :description="
            $t('new_broadcast.pages.select_groups.group_count', {
              count: group.memberCount,
            })
          "
          :selected="group.selected"
          @update:selected="handleGroupSelectionUpdate(group)"
        />
      </section>
    </section>
    <GroupSelectionListEmpty
      v-if="showEmptyList"
      @reset="handleReset"
    />
    <GroupSelectionListFooter
      :page="page"
      :pageSize="pageSize"
      :total="total"
      @update:page="handlePageUpdate"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, toRaw, type ComputedRef } from 'vue';
import { useGroupsStore } from '@/stores/groups';
import type { Group } from '@/types/groups';
import weniLoading from '@/assets/images/weni-loading.svg';
import GroupSelectionOption from '@/components/NewBroadcast/GroupSelection/GroupSelectionListOption.vue';
import GroupSelectionListFooter from '@/components/NewBroadcast/GroupSelection/GroupSelectionListFooter.vue';
import GroupSelectionListEmpty from '@/components/NewBroadcast/GroupSelection/GroupSelectionListEmpty.vue';

const groupsStore = useGroupsStore();

interface GroupWithSelected extends Group {
  selected: boolean;
}

const props = defineProps<{
  selectedGroups: Group[];
  maxColumns: number;
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
}>();

const emit = defineEmits(['update:page', 'update:selected-groups', 'reset']);

const showGroupsList = computed(() => {
  return !props.loading && groups.value.length > 0;
});

const showEmptyList = computed(() => {
  return !props.loading && groups.value.length === 0;
});

const groups: ComputedRef<GroupWithSelected[]> = computed(() => {
  return groupsStore.groups.map((group) => ({
    ...group,
    selected: props.selectedGroups.some(
      (selectedGroup) => selectedGroup.id === group.id,
    ),
  }));
});

const rows: ComputedRef<GroupWithSelected[][]> = computed(() => {
  return groups.value.reduce((acc, item, index) => {
    if (index % props.maxColumns === 0) {
      acc.push([item]);
    } else {
      acc[acc.length - 1].push(item);
    }
    return acc;
  }, [] as GroupWithSelected[][]);
});

const handlePageUpdate = (newPage: number) => {
  emit('update:page', newPage);
};

const handleReset = () => {
  emit('reset');
};

const handleGroupSelectionUpdate = (group: Group) => {
  let selectedGroupsCopy = structuredClone(toRaw(props.selectedGroups));

  if (isGroupSelected(group)) {
    selectedGroupsCopy = selectedGroupsCopy.filter(
      (selectedGroup) => selectedGroup.id !== group.id,
    );
  } else {
    selectedGroupsCopy.push(group);
  }
  emit('update:selected-groups', selectedGroupsCopy);
};

const isGroupSelected = (group: Group) => {
  return props.selectedGroups.some(
    (selectedGroup) => selectedGroup.id === group.id,
  );
};
</script>

<style scoped lang="scss">
.group-selection-list {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__row {
    display: flex;
    gap: $unnnic-spacing-sm;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 160px;
  }
}
</style>
