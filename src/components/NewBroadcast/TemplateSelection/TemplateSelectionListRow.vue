<template>
  <p
    :class="{
      'template-selection-list-row': true,
      'template-selection-list-row--selected': selected,
    }"
    data-test="template-list-row"
    :data-selected="selected"
  >
    <slot name="value" />
    <template v-if="hasValue">
      {{ value }}
    </template>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  selected: boolean;
  value?: string;
}>();

const hasValue = computed(() => {
  return props.value !== undefined && props.value !== null;
});
</script>

<style scoped lang="scss">
.template-selection-list-row {
  display: list-item;
  align-items: center;
  padding: $unnnic-spacing-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--selected {
    background-color: $unnnic-color-background-lightest;
    border-color: $unnnic-color-neutral-soft;
  }
}
</style>
