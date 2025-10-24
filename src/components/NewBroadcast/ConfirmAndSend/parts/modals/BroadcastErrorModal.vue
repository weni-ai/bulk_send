<template>
  <UnnnicModalDialog
    class="confirm-and-send__broadcast-errored-modal"
    :modelValue="!!error"
    :title="title"
    :primaryButtonProps="{ text: primaryText }"
    hideSecondaryButton
    showActionsDivider
    @primary-button-click="onBack"
  >
    <p class="confirm-and-send__broadcast-errored-content">
      {{ description }}
    </p>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
defineProps<{
  error: Error | undefined;
  title: string;
  primaryText: string;
  description: string;
  onBack: () => void;
}>();
</script>

<style scoped lang="scss">
.confirm-and-send__broadcast-errored-modal {
  &:deep(.unnnic-modal-dialog__container__actions) {
    display: flex;
    flex: 1;

    button {
      flex: 1;
    }
  }
}

.confirm-and-send__broadcast-errored-content {
  @include unnnic-text-body-gt;
  color: $unnnic-color-neutral-dark;
  white-space: pre-wrap;
}
</style>
