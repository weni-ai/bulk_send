<template>
  <BaseLayout class="new-broadcast-layout">
    <slot name="header" />
    <slot
      class="new-broadcast-layout__content"
      name="content"
    />
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue';
</script>

<style scoped lang="scss">
.new-broadcast-layout {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}
</style>
