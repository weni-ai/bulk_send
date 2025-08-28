<template>
  <BaseLayout>
    <section class="bulk-send-home-layout__header">
      <slot name="header" />
    </section>
    <slot
      class="bulk-send-home-layout__content"
      name="content"
    />
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue';
</script>

<style scoped lang="scss">
.bulk-send-home-layout {
  &__header::after {
    content: '';
    display: block;
    width: 100%;
    height: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }
}
</style>
