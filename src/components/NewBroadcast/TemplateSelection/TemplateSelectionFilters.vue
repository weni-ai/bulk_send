<template>
  <section class="template-selection-filters">
    <UnnnicInput
      class="template-selection-filters__search"
      :modelValue="search"
      iconLeft="search"
      size="sm"
      :placeholder="
        $t('new_broadcast.pages.select_template.filters.search_placeholder')
      "
      :iconRight="searchClearIcon"
      iconRightClickable
      data-test="search"
      @icon-right-click="handleSearchClear"
      @update:model-value="handleSearchUpdate"
    />

    <UnnnicButton
      class="template-selection-filters__new-template"
      size="small"
      type="secondary"
      iconLeft="add-1"
      :text="$t('new_broadcast.pages.select_template.filters.new_tamplate')"
      data-test="new-template"
      @click="handleNewTemplate"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{
  search: string;
}>();

const emit = defineEmits(['update:search']);

const handleSearchUpdate = useDebounceFn((value: string) => {
  emit('update:search', value);
}, 400);

const handleNewTemplate = () => {
  console.log('new template'); // TODO: Add when integrations is done
};

const searchClearIcon = computed(() => {
  return props.search !== '' ? 'close' : undefined;
});

const handleSearchClear = () => {
  emit('update:search', '');
};
</script>

<style scoped lang="scss">
.template-selection-filters {
  display: flex;
  gap: $unnnic-spacing-xs;

  &__search {
    flex: 4;
  }

  &__language {
    flex: 1;
  }

  &__new-template {
    flex: 1;
  }
}
</style>
