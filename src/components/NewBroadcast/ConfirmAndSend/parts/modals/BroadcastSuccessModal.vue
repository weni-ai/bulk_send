<template>
  <UnnnicModalDialog
    class="confirm-and-send__broadcast-success-modal"
    :modelValue="modelValue"
    :title="title"
    :primaryButtonProps="{ text: primaryText }"
    showActionsDivider
    hideSecondaryButton
    @primary-button-click="onBack"
  >
    <p
      class="confirm-and-send__broadcast-success-content"
      v-html="html"
    ></p>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title: string;
  primaryText: string;
  html: string;
  onBack: () => void;
}>();
</script>

<style scoped lang="scss">
.confirm-and-send__broadcast-success-modal {
  &:deep(.unnnic-modal-dialog__container__actions) {
    display: flex;
    flex: 1;

    button {
      flex: 1;
    }
  }
}

.confirm-and-send__broadcast-success-content {
  @include unnnic-text-body-gt;
  color: $unnnic-color-neutral-dark;
  white-space: pre-wrap;

  :deep(.highlight) {
    font-weight: $unnnic-font-weight-bold;
  }
}
</style>
