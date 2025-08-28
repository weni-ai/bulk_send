<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :primaryButtonProps="{
      text: $t('modals.new_contact_group.buttons.primary'),
    }"
    :secondaryButtonProps="{
      text: $t('modals.new_contact_group.buttons.secondary'),
    }"
    :title="$t('modals.new_contact_group.title')"
    size="md"
    showActionsDivider
    showCloseIcon
    @update:model-value="handleUpdateModelValue"
    @primary-button-click="handlePrimaryButtonClick"
    @secondary-button-click="handleSecondaryButtonClick"
  >
    <form class="new-contact-group-modal__form">
      <UnnnicInput
        :modelValue="groupName"
        :label="$t('modals.new_contact_group.name')"
        @update:model-value="handleUpdateGroupName"
      />
      <UnnnicDisclaimer
        icon="alert-circle-1-1"
        scheme="neutral-dark"
        :text="
          $t('modals.new_contact_group.disclaimer', {
            contactCount: contactCount.toLocaleString(),
            category: category,
            broadcastName: broadcastName,
          })
        "
      />
    </form>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  contactCount: number;
  category: string;
  broadcastName: string;
}>();

const emit = defineEmits(['update:modelValue']);

const groupName = ref(`${props.category} - ${props.broadcastName}`);

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

const handleUpdateGroupName = (value: string) => {
  groupName.value = value;
};

const handlePrimaryButtonClick = () => {
  console.log('primary button clicked');
};

const handleSecondaryButtonClick = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped lang="scss">
.new-contact-group-modal {
  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }
}
</style>
