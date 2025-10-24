<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :title="title"
  >
    <p class="confirm-and-send__contact-import-pending-content">
      {{ content }}
    </p>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title: string;
  content: string;
}>();
</script>

<style scoped lang="scss">
.confirm-and-send__contact-import-pending-content {
  @include unnnic-text-body-gt;
  color: $unnnic-color-neutral-cloudy;
  white-space: pre-line;
}
</style>
