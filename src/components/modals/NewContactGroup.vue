<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :primaryButtonProps="{
      text: $t('modals.new_contact_group.buttons.primary'),
      loading: broadcastsStore.loadingCreateGroupFromStatus,
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
            category: categoryLabel,
            broadcastName: broadcastName,
          })
        "
      />
    </form>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ContactGroupStatus } from '@/constants/broadcasts';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const broadcastsStore = useBroadcastsStore();
const projectStore = useProjectStore();

const props = defineProps<{
  modelValue: boolean;
  contactCount: number;
  category: keyof typeof ContactGroupStatus | null;
  broadcastName: string;
  broadcastID: number;
}>();

const categoryLabel = computed(() => {
  return t(`modals.new_contact_group.categories.${props.category}`);
});

const emit = defineEmits(['update:modelValue']);

const groupName = ref(`${categoryLabel.value} - ${props.broadcastName}`);

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

const handleUpdateGroupName = (value: string) => {
  groupName.value = value;
};

const handlePrimaryButtonClick = async () => {
  if (!props.category) {
    return;
  }

  await broadcastsStore.createGroupFromStatus(
    projectStore.project.uuid,
    groupName.value,
    props.broadcastID,
    props.category,
  );

  emit('update:modelValue', false);
  // TODO: check with design if we need to show a success message
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
