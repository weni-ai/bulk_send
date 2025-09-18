<!-- eslint-disable vue/no-v-html -->
<template>
  <section class="confirm-and-send">
    <section class="confirm-and-send__main">
      <h1 class="confirm-and-send__title">
        {{ $t('new_broadcast.pages.confirm_and_send.title') }}
      </h1>

      <section class="confirm-and-send__content">
        <section class="confirm-and-send__form">
          <UnnnicFormElement
            :label="
              $t('new_broadcast.pages.confirm_and_send.broadcast_name_label')
            "
          >
            <UnnnicInput
              :modelValue="broadcastName"
              :placeholder="
                $t(
                  'new_broadcast.pages.confirm_and_send.broadcast_name_placeholder',
                )
              "
              @update:model-value="handleBroadcastNameUpdate"
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
              @update:model-value="handleFlowSelectUpdate"
            />
          </UnnnicFormElement>
          <UnnnicDisclaimer
            v-else
            icon="alert-circle-1-1"
            :text="$t('new_broadcast.pages.confirm_and_send.flow_disclaimer')"
          />

          <section class="confirm-and-send__info">
            <ConfirmAndSendAudience class="confirm-and-send__audience" />

            <VariablesSelectionOverview
              v-if="hasMappedVariable"
              class="confirm-and-send__variables"
              :title="
                $t('new_broadcast.pages.confirm_and_send.variables.title')
              "
              :definedVariables="definedVariables"
            />
          </section>

          <UnnnicCheckbox
            :modelValue="reviewed"
            size="md"
            :textRight="
              $t('new_broadcast.pages.confirm_and_send.reviewed_label')
            "
            @update:model-value="handleReviewedUpdate"
          />
        </section>

        <TemplateSelectionPreview class="confirm-and-send__preview" />
      </section>

      <UnnnicModalDialog
        :modelValue="importNotCompleted"
        :title="
          $t(
            'new_broadcast.pages.confirm_and_send.contact_import_pending.title',
          )
        "
      >
        <p class="confirm-and-send__contact-import-pending-content">
          {{
            $t(
              'new_broadcast.pages.confirm_and_send.contact_import_pending.content',
            )
          }}
        </p>
      </UnnnicModalDialog>

      <UnnnicModalDialog
        class="confirm-and-send__broadcast-errored-modal"
        :modelValue="!!broadcastErrored"
        :title="
          $t('new_broadcast.pages.confirm_and_send.broadcast_errored.title')
        "
        :primaryButtonProps="{
          text: $t(
            'new_broadcast.pages.confirm_and_send.broadcast_errored.primary_button',
          ),
        }"
        hideSecondaryButton
        showActionsDivider
        @primary-button-click="handleErrorBack"
      >
        <p class="confirm-and-send__broadcast-errored-content">
          {{
            $t(
              'new_broadcast.pages.confirm_and_send.broadcast_errored.description',
              { error: broadcastErrored?.message },
            )
          }}
        </p>
      </UnnnicModalDialog>

      <UnnnicModalDialog
        class="confirm-and-send__broadcast-success-modal"
        :modelValue="broadcastSuccess"
        :title="
          $t('new_broadcast.pages.confirm_and_send.broadcast_success.title')
        "
        :primaryButtonProps="{
          text: $t(
            'new_broadcast.pages.confirm_and_send.broadcast_success.primary_button',
          ),
        }"
        showActionsDivider
        hideSecondaryButton
        @primary-button-click="handleSuccessBack"
      >
        <p
          class="confirm-and-send__broadcast-success-content"
          v-html="
            $t(
              'new_broadcast.pages.confirm_and_send.broadcast_success.content',
              {
                contact_count: contactCount,
              },
            )
          "
        ></p>
      </UnnnicModalDialog>
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
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { useContactImportStore } from '@/stores/contactImport';
import { useFlowsStore } from '@/stores/flows';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import VariablesSelectionOverview from '@/components/NewBroadcast/VariablesSelection/VariablesSelectionOverview.vue';
import ConfirmAndSendAudience from '@/components/NewBroadcast/ConfirmAndSend/ConfirmAndSendAudience.vue';
import { ProjectType } from '@/constants/project';
import type { SelectOption } from '@/types/select';
import { ContactImportStatus } from '@/types/contactImport';
import StepActions from '@/components/NewBroadcast/StepActions.vue';
import { NewBroadcastPage } from '@/constants/broadcasts';
import type { ContactField } from '@/types/contacts';
import type { Template } from '@/types/template';

const { t } = useI18n();
const router = useRouter();

const broadcastsStore = useBroadcastsStore();
const projectStore = useProjectStore();
const flowsStore = useFlowsStore();
const contactImportStore = useContactImportStore();

type FlowOption = SelectOption<string>;

const timeoutId = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
const broadcastErrored = ref<Error | undefined>(undefined);
const broadcastSuccess = ref(false);

onBeforeMount(() => {
  clearInputs();

  broadcastsStore.setBroadcastName(createInitialBroadcastName());
  flowsStore.listAllFlows();
  startImportCheck();
});

onBeforeUnmount(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
});

const loadingCreateBroadcast = computed(() => {
  return broadcastsStore.loadingCreateBroadcast;
});

const broadcastName = computed(() => {
  return broadcastsStore.newBroadcast.broadcastName;
});

const reviewed = computed(() => {
  return broadcastsStore.newBroadcast.reviewed;
});

const projectType = computed<ProjectType>(() => {
  return projectStore.project.brainOn ? ProjectType.AB : ProjectType.FLOW;
});

const loadingFlows = computed(() => {
  return flowsStore.loadingFlows;
});

const projectFlowsOptions = computed<FlowOption[]>(() => {
  return flowsStore.flows.map((flow) => ({
    label: flow.name,
    value: flow.uuid,
  }));
});

const selectedFlowOption = computed<FlowOption[]>(() => {
  if (!broadcastsStore.newBroadcast.selectedFlow) {
    return [];
  }

  return [
    {
      label: broadcastsStore.newBroadcast.selectedFlow.name,
      value: broadcastsStore.newBroadcast.selectedFlow.uuid,
    },
  ];
});

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

const importNotCompleted = computed(() => {
  return (
    contactImportStore.contactImportInfo.status ===
      ContactImportStatus.PENDING ||
    contactImportStore.contactImportInfo.status ===
      ContactImportStatus.PROCESSING
  );
});

const contactCount = computed(() => {
  if (contactImportStore.import) {
    return contactImportStore.import.numRecords;
  } else {
    return broadcastsStore.newBroadcast.selectedGroups.reduce(
      (acc, group) => acc + group.memberCount,
      0,
    );
  }
});

const createInitialBroadcastName = () => {
  const date = format(new Date(), 'dd_MM');
  return `${broadcastsStore.newBroadcast.selectedTemplate?.name}_${date}`;
};

const handleBroadcastNameUpdate = (value: string) => {
  broadcastsStore.setBroadcastName(value);
};

const handleFlowSelectUpdate = (selection: FlowOption[]) => {
  const flowUuid = selection[0].value;

  const flow = flowsStore.flows.find((flow) => flow.uuid === flowUuid);

  broadcastsStore.setSelectedFlow(flow);
};

const handleReviewedUpdate = (value: boolean) => {
  broadcastsStore.setReviewed(value);
};

const startImportCheck = async () => {
  if (!contactImportStore.import) {
    return;
  }

  await contactImportStore.getImportInfo(contactImportStore.import.importId);

  if (importNotCompleted.value) {
    timeoutId.value = setTimeout(() => {
      startImportCheck();
    }, 5000);
  }
};

const clearInputs = () => {
  broadcastsStore.setBroadcastName('');
  broadcastsStore.setSelectedFlow(undefined);
};

const canContinue = computed(() => {
  let canConfirm = true;
  if (contactImportStore.import) {
    canConfirm =
      contactImportStore.contactImportInfo.status ===
      ContactImportStatus.COMPLETE;
  }

  if (!projectStore.project.brainOn) {
    canConfirm = canConfirm && !!broadcastsStore.newBroadcast.selectedFlow;
  }

  return canConfirm && broadcastsStore.newBroadcast.reviewed;
});

const handleCancel = () => {
  broadcastsStore.setReviewed(false);
  broadcastsStore.setSelectedFlow(undefined);
  broadcastsStore.setBroadcastName('');

  if (
    broadcastsStore.newBroadcast.selectedTemplate?.variableCount &&
    broadcastsStore.newBroadcast.selectedTemplate.variableCount > 0
  ) {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_VARIABLES);
  } else {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
  }
};

const handleErrorBack = () => {
  broadcastErrored.value = undefined;
};

const handleSuccessBack = () => {
  broadcastSuccess.value = false;
  broadcastsStore.resetNewBroadcast();
  router.push({ name: 'HomeBulkSend' });
};

const requiresVariables = (template: Template) => {
  return template.variableCount && template.variableCount > 0;
};

const handleContinue = async () => {
  try {
    const groups = await getSelectedGroups();
    if (!groups || groups.length === 0) {
      throw new Error(
        t('new_broadcast.pages.confirm_and_send.groups_not_found'),
      );
    }

    const name = broadcastsStore.newBroadcast.broadcastName.trim();
    if (!name) {
      throw new Error(t('new_broadcast.pages.confirm_and_send.name_not_found'));
    }

    const template = broadcastsStore.newBroadcast.selectedTemplate;
    if (!template) {
      throw new Error(
        t('new_broadcast.pages.confirm_and_send.template_not_found'),
      );
    }

    const variables = createVariablesList();
    if (requiresVariables(template) && (!variables || variables.length === 0)) {
      throw new Error(
        t('new_broadcast.pages.confirm_and_send.variables_not_found'),
      );
    }

    await broadcastsStore.createBroadcast(name, template, variables, groups);
    broadcastSuccess.value = true;
  } catch (error) {
    if (error instanceof Error) {
      broadcastErrored.value = error;
    } else {
      broadcastErrored.value = new Error(
        t('new_broadcast.pages.confirm_and_send.unknown_error'),
      );
    }
  }
};

const getSelectedGroups = async (): Promise<string[]> => {
  if (contactImportStore.import) {
    await contactImportStore.getImportInfo(contactImportStore.import.importId);

    if (!contactImportStore.contactImportGroup?.uuid) {
      throw new Error('Contact import group uuid not found');
    }

    return [contactImportStore.contactImportGroup.uuid];
  } else {
    return broadcastsStore.newBroadcast.selectedGroups.map(
      (group) => group.uuid,
    );
  }
};

const createVariablesList = () => {
  const variablesMapping = broadcastsStore.newBroadcast.variableMapping;
  const variables = [];
  if (!variablesMapping) {
    throw new Error('Variables mapping not found');
  }

  if (hasIncompleteMapping(variablesMapping)) {
    throw new Error('Variables mapping is not complete');
  }

  for (let i = 0; i < Object.keys(variablesMapping).length; i++) {
    variables.push(`@fields.${variablesMapping[i]!.key}`); // TODO: handle @contact.name in the future
  }

  return variables;
};

const hasIncompleteMapping = (
  variablesMapping: Record<number, ContactField | undefined>,
) => {
  return Object.values(variablesMapping).some(
    (variable) => variable === undefined,
  );
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
    display: flex;
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

  &__info {
    display: flex;
    gap: $unnnic-spacing-sm;
  }

  &__audience,
  &__variables {
    flex: 1;
  }

  &__contact-import-pending-content {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-cloudy;
    white-space: pre-line;
  }

  &__broadcast-success-modal,
  &__broadcast-errored-modal {
    &:deep(.unnnic-modal-dialog__container__actions) {
      display: flex;
      flex: 1;

      button {
        flex: 1;
      }
    }
  }

  &__broadcast-success-content {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-dark;
    white-space: pre-wrap;

    :deep(.highlight) {
      font-weight: $unnnic-font-weight-bold;
    }
  }

  &__broadcast-errored-content {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-dark;
    white-space: pre-wrap;
  }
}
</style>
