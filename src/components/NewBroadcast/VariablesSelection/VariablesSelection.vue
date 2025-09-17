<template>
  <section class="variables-selection">
    <section class="variables-selection__content">
      <section class="variables-selection__variables-list">
        <h1 class="variables-selection__title">
          {{ $t('new_broadcast.pages.select_variables.page_title') }}
        </h1>

        <VariablesSelectionOverview
          v-if="hasMappedVariable"
          :definedVariables="definedVariables"
        />

        <UnnnicFormElement
          v-for="index in templateVariablesCount"
          :key="index"
          class="variables-selection__item"
          :label="
            $t('new_broadcast.pages.select_variables.variable_label', {
              index,
            })
          "
        >
          <UnnnicSelectSmart
            :options="contactFields"
            :modelValue="variableOption(index - 1)"
            autocomplete
            autocompleteClearOnFocus
            enableSearchByValue
            :isLoading="loadingContactFields"
            :placeholder="
              $t('new_broadcast.pages.select_variables.variable_placeholder')
            "
            @update:model-value="
              (event: ContactFieldOption[]) =>
                handleVariableUpdate(index - 1, event)
            "
          />
        </UnnnicFormElement>

        <UnnnicDisclaimer
          v-if="hasMappedVariable"
          class="variables-selection__disclaimer"
          icon="alert-circle-1-1"
          scheme="neutral-dark"
          :text="$t('new_broadcast.pages.select_variables.disclaimer')"
        />
      </section>

      <TemplateSelectionPreview
        class="variables-selection__preview"
        :variablesToReplace="variablesToReplace"
      />
    </section>

    <StepActions
      :disabled="!canContinue"
      :cancelText="$t('new_broadcast.pages.select_variables.actions.cancel')"
      @cancel="handleCancel"
      @continue="handleContinue"
    />
  </section>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import { useContactStore } from '@/stores/contact';
import { useBroadcastsStore } from '@/stores/broadcasts';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import VariablesSelectionOverview from '@/components/NewBroadcast/VariablesSelection/VariablesSelectionOverview.vue';
import type { SelectOption } from '@/types/select';
import { NewBroadcastPage } from '@/constants/broadcasts';
import StepActions from '@/components/NewBroadcast/StepActions.vue';

const contactStore = useContactStore();
const broadcastsStore = useBroadcastsStore();

type ContactFieldOption = SelectOption<string>;

onBeforeMount(() => {
  fetchContactFields();
});

const contactFields = computed(() => {
  return contactStore.contactFields.map(
    (field) =>
      <ContactFieldOption>{
        label: field.label,
        value: field.key,
      },
  );
});

const loadingContactFields = computed(() => {
  return contactStore.loadingContactFields;
});

const templateVariablesCount = computed(() => {
  return broadcastsStore.newBroadcast.selectedTemplate?.variableCount ?? 0;
});

const variableMapping = computed(() => {
  return broadcastsStore.newBroadcast.variableMapping;
});

const definedVariables = computed(() => {
  return Object.values(variableMapping.value).filter(
    (variable) => variable !== undefined,
  );
});

const hasMappedVariable = computed(() => {
  return Object.values(broadcastsStore.newBroadcast.variableMapping).some(
    (mapping) => mapping !== undefined,
  );
});

const variablesToReplace = computed(() => {
  const fieldsKeys = Object.values(
    broadcastsStore.newBroadcast.variableMapping,
  ).map((variable) => variable?.key);
  const examples: (string | undefined)[] = [];
  fieldsKeys.forEach((key) => {
    const field = contactStore.contactFieldsExamples.find(
      (field) => field.key === key,
    );

    examples.push(field?.example);
  });

  return examples;
});

const fetchContactFields = async () => {
  initializeVariableMapping();
  contactStore.fetchContactFields();

  if (broadcastsStore.newBroadcast.selectedGroups.length > 0) {
    contactStore.getContactFieldsExamplesByGroups(
      broadcastsStore.newBroadcast.selectedGroups,
    );
  }
};

const initializeVariableMapping = () => {
  const variableCount = templateVariablesCount.value;
  for (let i = 0; i < variableCount; i++) {
    broadcastsStore.updateVariableMapping(i, undefined);
  }
};

const handleVariableUpdate = (key: number, newValue: ContactFieldOption[]) => {
  if (newValue.length === 0) {
    broadcastsStore.updateVariableMapping(key, undefined);
    return;
  }

  const newFieldKey = newValue[0];

  const field = contactStore.contactFields.find(
    (field) => field.key === newFieldKey.value,
  );

  broadcastsStore.updateVariableMapping(key, field);
};

const variableOption = (index: number): ContactFieldOption[] => {
  const mapping = broadcastsStore.newBroadcast.variableMapping;

  if (!mapping[index]) {
    return [];
  }

  return [
    {
      label: mapping[index].label,
      value: mapping[index].key,
    },
  ];
};

const canContinue = computed(() => {
  return (
    broadcastsStore.newBroadcast.variableMapping &&
    Object.values(broadcastsStore.newBroadcast.variableMapping).every(
      (variable) => variable !== undefined,
    )
  );
});

const handleCancel = () => {
  broadcastsStore.clearVariableMapping();
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
};

const handleContinue = () => {
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.CONFIRM_AND_SEND);
};
</script>

<style scoped lang="scss">
.variables-selection {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  flex: 1;
  overflow: auto;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__content {
    display: flex;
    gap: $unnnic-spacing-sm;
    overflow: auto;
  }

  &__variables-list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    flex: 1;
  }

  &__item-label {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
