<template>
  <section :class="`bulk-send-home-layout`">
    <slot class="header" name="header" />
    <div class="divider"></div>
    <slot class="content" name="content" />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.bulk-send-home-layout {
  height: 100%;
  padding: $unnnic-spacing-sm;

  & .divider {
    height: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }
}
</style>
