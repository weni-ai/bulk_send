<!-- eslint-disable vue/no-v-html -->
<template>
  <section class="confirm-and-send">
    <section class="confirm-and-send__main">
      <h1 class="confirm-and-send__title">
        {{ $t('new_broadcast.pages.confirm_and_send.title') }}
      </h1>

      <section class="confirm-and-send__content">
        <section class="confirm-and-send__form">
          <ConfirmForm
            :broadcastName="broadcastName"
            :projectType="projectType"
            :projectFlowsOptions="projectFlowsOptions"
            :selectedFlowOption="selectedFlowOption"
            :loadingFlows="loadingFlows"
            :onBroadcastNameUpdate="handleBroadcastNameUpdate"
            :onFlowSelectUpdate="handleFlowSelectUpdate"
          />

          <AudienceAndVariables
            :hasMappedVariable="hasMappedVariable"
            :definedVariables="definedVariables"
          />

          <UnnnicCheckbox
            :modelValue="reviewed"
            size="md"
            :textRight="
              $t('new_broadcast.pages.confirm_and_send.reviewed_label')
            "
            @update:model-value="handleReviewedUpdate"
          />
        </section>

        <TemplateSelectionPreview
          class="confirm-and-send__preview"
          :replaceVariables="true"
        />
      </section>

      <ContactImportPendingModal
        :modelValue="importNotCompleted"
        :title="
          $t(
            'new_broadcast.pages.confirm_and_send.contact_import_pending.title',
          )
        "
        :content="
          $t(
            'new_broadcast.pages.confirm_and_send.contact_import_pending.content',
          )
        "
      />

      <BroadcastErrorModal
        :error="broadcastErrored"
        :title="
          $t('new_broadcast.pages.confirm_and_send.broadcast_errored.title')
        "
        :primaryText="
          $t(
            'new_broadcast.pages.confirm_and_send.broadcast_errored.primary_button',
          )
        "
        :description="
          $t(
            'new_broadcast.pages.confirm_and_send.broadcast_errored.description',
            { error: broadcastErrored?.message },
          )
        "
        :onBack="handleErrorBack"
      />

      <BroadcastSuccessModal
        :modelValue="broadcastSuccess"
        :title="
          $t('new_broadcast.pages.confirm_and_send.broadcast_success.title')
        "
        :primaryText="
          $t(
            'new_broadcast.pages.confirm_and_send.broadcast_success.primary_button',
          )
        "
        :html="
          $t('new_broadcast.pages.confirm_and_send.broadcast_success.content', {
            contact_count: contactCount,
          })
        "
        :onBack="handleSuccessBack"
      />
    </section>

    <StepActions
      :disabled="!canContinue"
      :loading="loadingCreateBroadcast"
      :cancelText="$t('new_broadcast.pages.confirm_and_send.actions.cancel')"
      @cancel="handleCancel"
      @continue="handleContinue"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { format } from 'date-fns';
import { useProjectStore } from '@/stores/project';
import { useContactImportStore } from '@/stores/contactImport';
import { useFlowsStore } from '@/stores/flows';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import { ProjectType } from '@/constants/project';
import StepActions from '@/components/NewBroadcast/StepActions.vue';
// import { NewBroadcastPage } from '@/constants/broadcasts';
import ConfirmForm from './parts/ConfirmForm.vue';
import AudienceAndVariables from './parts/AudienceAndVariables.vue';
import ContactImportPendingModal from './parts/modals/ContactImportPendingModal.vue';
import BroadcastErrorModal from './parts/modals/BroadcastErrorModal.vue';
import BroadcastSuccessModal from './parts/modals/BroadcastSuccessModal.vue';
import { useFlowSelection } from './composables/useFlowSelection';
import { useImportPolling } from './composables/useImportPolling';
import { useConfirmActions } from './composables/useConfirmActions';

const { t } = useI18n();

const broadcastsStore = useBroadcastsStore();
const projectStore = useProjectStore();
const flowsStore = useFlowsStore();
const contactImportStore = useContactImportStore();

const {
  loadingFlows,
  projectFlowsOptions,
  selectedFlowOption,
  handleFlowSelectUpdate,
} = useFlowSelection(flowsStore, broadcastsStore);

const {
  loadingCreateBroadcast,
  canContinue,
  handleCancel,
  handleContinue,
  handleSuccessBack,
  handleErrorBack,
  broadcastErrored,
  broadcastSuccess,
  contactCount,
} = useConfirmActions({
  t,
  broadcastsStore,
  contactImportStore,
  projectStore,
});

const { importNotCompleted, start: startImportCheck } =
  useImportPolling(contactImportStore);

const broadcastName = computed(
  () => broadcastsStore.newBroadcast.broadcastName,
);
const reviewed = computed(() => broadcastsStore.newBroadcast.reviewed);
const projectType = computed<ProjectType>(() =>
  projectStore.project.brainOn ? ProjectType.AB : ProjectType.FLOW,
);

const handleBroadcastNameUpdate = (value: string) => {
  broadcastsStore.setBroadcastName(value);
};

const handleReviewedUpdate = (value: boolean) => {
  broadcastsStore.setReviewed(value);
};

const definedVariables = computed(() => {
  return Object.values(broadcastsStore.newBroadcast.variableMapping).filter(
    (variable) => variable !== undefined,
  );
});

const hasMappedVariable = computed(() => {
  return Object.values(broadcastsStore.newBroadcast.variableMapping).some(
    (mapping) => mapping !== undefined,
  );
});

onBeforeMount(() => {
  broadcastsStore.setBroadcastName('');
  broadcastsStore.setSelectedFlow(undefined);
  broadcastsStore.setBroadcastName(createInitialBroadcastName());
  flowsStore.listAllFlows();
  startImportCheck();
});

const createInitialBroadcastName = () => {
  const date = format(new Date(), 'dd_MM');
  return `${broadcastsStore.newBroadcast.selectedTemplate?.name}_${date}`;
};
</script>

<style scoped lang="scss">
.confirm-and-send {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  flex: 1;
  overflow: auto;

  &__main {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    flex: 1;
    overflow: auto;
  }

  &__content {
    display: grid;
    grid-template-columns: 8fr 4fr;
    gap: $unnnic-spacing-sm;
  }

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__form {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: $unnnic-spacing-sm;
  }
}
</style>
