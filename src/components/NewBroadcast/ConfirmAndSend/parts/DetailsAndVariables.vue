<template>
  <section class="confirm-and-send__info">
    <ConfirmAndSendDetails class="confirm-and-send__details" />

    <VariablesSelectionOverview
      v-if="hasMappedVariable"
      class="confirm-and-send__variables"
      :title="$t('new_broadcast.pages.confirm_and_send.variables.title')"
      :definedVariables="definedVariables"
    />
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import VariablesSelectionOverview from '@/components/NewBroadcast/VariablesSelection/VariablesSelectionOverview.vue';
import ConfirmAndSendDetails from '@/components/NewBroadcast/ConfirmAndSend/ConfirmAndSendDetails.vue';
import type { ContactField } from '@/types/contacts';

defineProps<{
  hasMappedVariable: boolean;
  definedVariables: ContactField[];
}>();

useI18n();
</script>

<style scoped lang="scss">
.confirm-and-send__info {
  display: flex;
  gap: $unnnic-spacing-sm;
}

.confirm-and-send__details,
.confirm-and-send__variables {
  flex: 1;
}
</style>
