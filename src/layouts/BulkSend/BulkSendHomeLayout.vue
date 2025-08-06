<template>
  <section :class="`bulk-send-home-layout`">
    <slot class="bulk-send-home-layout__header" name="header" />
    <BasicDivider />
    <slot class="bulk-send-home-layout__content" name="content" />
  </section>
</template>

<script setup lang="ts">
import BasicDivider from '@/components/BasicDivider.vue';
</script>

<style scoped lang="scss">
.bulk-send-home-layout {
  height: 100%;
  padding: $unnnic-spacing-sm;

  &__divider {
    height: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }
}
</style>
