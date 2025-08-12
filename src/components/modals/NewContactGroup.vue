<template>
  <UnnnicModalDialog
    :model-value="modelValue"
    @update:model-value="handleUpdateModelValue"
    @primaryButtonClick="handlePrimaryButtonClick"
    @secondaryButtonClick="handleSecondaryButtonClick"
    :primary-button-props="{
      text: $t('modals.new_contact_group.buttons.primary'),
    }"
    :secondary-button-props="{
      text: $t('modals.new_contact_group.buttons.secondary'),
    }"
    :title="$t('modals.new_contact_group.title')"
    size="md"
    showActionsDivider
    showCloseIcon
  >
    <form class="new-contact-group-modal__form">
      <UnnnicInput
        :model-value="groupName"
        @update:model-value="handleUpdateGroupName"
        :label="$t('modals.new_contact_group.name')"
      />
      <UnnnicDisclaimer
        icon="alert-circle-1-1"
        scheme="neutral-dark"
        :text="
          $t('modals.new_contact_group.disclaimer', {
            contactCount: contactCount,
            category: category,
            broadcastName: broadcastName,
          })
        "
      />
    </form>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
  contactCount: string
  category: string
  broadcastName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const groupName = ref(`${props.category} - ${props.broadcastName}`)

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}

const handleUpdateGroupName = (value: string) => {
  groupName.value = value
}

const handlePrimaryButtonClick = () => {
  console.log('primary button clicked')
}

const handleSecondaryButtonClick = () => {
  emit('update:modelValue', false)
}
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
