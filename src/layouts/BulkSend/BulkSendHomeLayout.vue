<template>
  <section :class="`bulk-send-home-layout`">
    <section class="bulk-send-home-layout__header">
      <slot name="header" />
    </section>
    <slot
      class="bulk-send-home-layout__content"
      name="content"
    />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.bulk-send-home-layout {
  height: 100%;
  padding: $unnnic-spacing-sm;

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
