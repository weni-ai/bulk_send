<template>
  <section class="base-layout">
    <slot />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.base-layout {
  height: 100%;
  padding: $unnnic-spacing-sm;
  overflow: auto;
}
</style>
