<template>
  <section class="group-selection-filters">
    <UnnnicInput
      :modelValue="search"
      class="group-selection-filters__search"
      :placeholder="$t('new_broadcast.pages.select_groups.search_placeholder')"
      iconLeft="search"
      :iconRight="searchClearIcon"
      iconRightClickable
      @icon-right-click="handleSearchClear"
      @update:model-value="handleSearchUpdate"
    />
    <section class="group-selection-filters__sort-container">
      <p class="group-selection-filters__sort-label">
        {{ $t('new_broadcast.pages.select_groups.sort_by.label') }}
      </p>
      <section class="group-selection-filters__sort-options">
        <UnnnicRadio
          v-for="option in SORT_OPTIONS"
          :key="option"
          :value="option"
          :modelValue="sort"
          @update:model-value="handleSortUpdate"
        >
          {{ option }}
        </UnnnicRadio>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SORT_OPTIONS } from '@/constants/groups';

const props = defineProps<{
  search: string;
  sort: string;
}>();

const emit = defineEmits(['update:search', 'update:sort']);

const searchClearIcon = computed(() => {
  return props.search !== '' ? 'close' : undefined;
});

const handleSearchClear = () => {
  emit('update:search', '');
};

const handleSearchUpdate = (value: string) => {
  emit('update:search', value);
};

const handleSortUpdate = (value: keyof typeof SORT_OPTIONS) => {
  emit('update:sort', value);
};
</script>

<style lang="scss" scoped>
.group-selection-filters {
  display: flex;
  gap: $unnnic-spacing-md;
  align-items: center;

  &__search {
    flex: 1;
  }

  &__sort-container {
    display: flex;
    gap: $unnnic-spacing-xs;
    align-items: center;
  }
}
</style>
