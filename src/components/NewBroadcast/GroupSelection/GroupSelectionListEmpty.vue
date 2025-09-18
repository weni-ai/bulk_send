<template>
  <section
    class="group-selection-list__empty"
    data-test="empty"
  >
    <p
      class="group-selection-list__empty-text"
      data-test="empty-text"
    >
      {{ $t('new_broadcast.pages.select_groups.no_groups') }}
    </p>
    <UnnnicButton
      :text="$t('new_broadcast.pages.select_groups.clear_filters')"
      type="secondary"
      @click="handleReset"
    />
  </section>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';

const emit = defineEmits(['reset']);

const handleReset = useDebounceFn(() => {
  emit('reset');
}, 300);
</script>

<style scoped lang="scss">
.group-selection-list__empty {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  align-items: center;
  justify-content: center;
}
</style>
