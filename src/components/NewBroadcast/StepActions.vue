<template>
  <section class="step-actions">
    <UnnnicButton
      data-test="actions-cancel"
      class="step-actions__cancel"
      type="tertiary"
      @click="$emit('cancel')"
    >
      {{ $t('new_broadcast.pages.actions.cancel') }}
    </UnnnicButton>
    <UnnnicButton
      data-test="actions-continue"
      class="step-actions__continue"
      :disabled="disabled"
      :loading="loading"
      @click="$emit('continue')"
    >
      {{ $t('new_broadcast.pages.actions.continue') }}
    </UnnnicButton>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{
  (e: 'cancel'): void;
  (e: 'continue'): void;
}>();
</script>

<style scoped lang="scss">
.step-actions {
  display: flex;
  margin-top: auto;
  gap: $unnnic-spacing-sm;

  &__cancel,
  &__continue {
    flex: 1;
  }
}
</style>
