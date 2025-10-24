<template>
  <section class="confirm-and-send-form">
    <UnnnicFormElement
      :label="$t('new_broadcast.pages.confirm_and_send.broadcast_name_label')"
    >
      <UnnnicInput
        :modelValue="broadcastName"
        :placeholder="
          $t('new_broadcast.pages.confirm_and_send.broadcast_name_placeholder')
        "
        @update:model-value="onBroadcastNameUpdate"
      />
    </UnnnicFormElement>

    <UnnnicFormElement
      v-if="projectType === ProjectType.FLOW"
      :label="$t('new_broadcast.pages.confirm_and_send.flow_label')"
      :message="$t('new_broadcast.pages.confirm_and_send.flow_message')"
    >
      <UnnnicSelectSmart
        :options="projectFlowsOptions"
        :modelValue="selectedFlowOption"
        autocomplete
        autocompleteClearOnFocus
        enableSearchByValue
        :placeholder="
          $t('new_broadcast.pages.confirm_and_send.flow_placeholder')
        "
        :isLoading="loadingFlows"
        @update:model-value="onFlowSelectUpdate"
      />
    </UnnnicFormElement>
    <UnnnicDisclaimer
      v-else
      icon="alert-circle-1-1"
      :text="$t('new_broadcast.pages.confirm_and_send.flow_disclaimer')"
    />
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ProjectType } from '@/constants/project';
import type { SelectOption } from '@/types/select';

type FlowOption = SelectOption<string>;

defineProps<{
  broadcastName: string;
  projectType: ProjectType;
  projectFlowsOptions: FlowOption[];
  selectedFlowOption: FlowOption[];
  loadingFlows: boolean;
  onBroadcastNameUpdate: (value: string) => void;
  onFlowSelectUpdate: (selection: FlowOption[]) => void;
}>();

useI18n();
</script>

<style scoped lang="scss">
/* Presentational only; parent provides container layout styles */
.confirm-and-send-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: $unnnic-spacing-sm;
}
</style>
