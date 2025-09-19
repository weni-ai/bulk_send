<template>
  <section class="variables-selection">
    <section class="variables-selection__content">
      <section class="variables-selection__main">
        <section
          v-if="templateVariablesCount > 0"
          class="variables-selection__variables-list"
        >
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
              orderedByIndex
              :selectFirst="false"
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

        <VariablesSelectionHeaderMedia v-if="hasMediaHeader" />
      </section>

      <TemplateSelectionPreview
        class="variables-selection__preview"
        :replaceVariables="true"
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
import { useI18n } from 'vue-i18n';
import { useContactStore } from '@/stores/contact';
import { useBroadcastsStore } from '@/stores/broadcasts';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import VariablesSelectionOverview from '@/components/NewBroadcast/VariablesSelection/VariablesSelectionOverview.vue';
import VariablesSelectionHeaderMedia from '@/components/NewBroadcast/VariablesSelection/VariablesSelectionHeaderMedia.vue';
import { NewBroadcastPage, NAME_FIELD_VALUE } from '@/constants/broadcasts';
import StepActions from '@/components/NewBroadcast/StepActions.vue';
import {
  ContactFieldType,
  type ContactField,
  type ContactFieldOption,
} from '@/types/contacts';

const contactStore = useContactStore();
const broadcastsStore = useBroadcastsStore();
const { t } = useI18n();

onBeforeMount(() => {
  fetchContactFields();
});

const nameFieldOption: ContactFieldOption = {
  label: t('new_broadcast.pages.select_variables.name_field_label'),
  value: NAME_FIELD_VALUE,
};

const contactFields = computed(() => {
  const fields = contactStore.contactFields.map(
    (field) =>
      <ContactFieldOption>{
        label: field.label,
        value: field.key,
      },
  );

  // always add name field if not loading anymore
  if (!contactStore.loadingContactFields) {
    fields.unshift(nameFieldOption);
  }

  return fields;
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

const hasMediaHeader = computed(() => {
  return (
    broadcastsStore.newBroadcast.selectedTemplate?.header &&
    broadcastsStore.newBroadcast.selectedTemplate?.header.type !== 'TEXT'
  );
});

const fetchContactFields = async () => {
  initializeVariableMapping();

  if (contactStore.contactFields.length === 0) {
    contactStore.fetchContactFields();
  }

  if (broadcastsStore.newBroadcast.selectedGroups.length > 0) {
    contactStore.getContactFieldsExamplesByGroups(
      broadcastsStore.newBroadcast.selectedGroups,
    );
  }
};

const initializeVariableMapping = () => {
  if (Object.keys(broadcastsStore.newBroadcast.variableMapping).length > 0) {
    return;
  }

  const variableCount = templateVariablesCount.value;
  for (let i = 0; i < variableCount; i++) {
    broadcastsStore.updateVariableMapping(i, undefined);
  }
};

const handleVariableUpdate = (key: number, newValue: ContactFieldOption[]) => {
  if (!newValue || newValue.length === 0) {
    broadcastsStore.updateVariableMapping(key, undefined);
    return;
  }

  // check if the value is the same as the old value
  const oldValue = variableMapping.value[key];
  if (oldValue?.key === newValue[0].value) {
    return;
  }

  const newFieldKey = newValue[0];

  if (newFieldKey.value === NAME_FIELD_VALUE) {
    const nameField: ContactField = {
      label: nameFieldOption.label,
      key: newFieldKey.value,
      valueType: ContactFieldType.TEXT,
    };

    broadcastsStore.updateVariableMapping(key, nameField);
    return;
  }

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

const hasFilledVariables = computed(() => {
  if (templateVariablesCount.value === 0) {
    return true;
  }

  return (
    broadcastsStore.newBroadcast.variableMapping &&
    Object.values(broadcastsStore.newBroadcast.variableMapping).every(
      (variable) => variable !== undefined,
    )
  );
});

const hasFilledHeaderMedia = computed(() => {
  if (!hasMediaHeader.value) {
    return true;
  }

  return (
    broadcastsStore.newBroadcast.headerMediaFileUrl &&
    broadcastsStore.newBroadcast.headerMediaFileUrl !== undefined
  );
});

const canContinue = computed(() => {
  return hasFilledVariables.value && hasFilledHeaderMedia.value;
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

  &__main {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    flex: 1;
  }

  &__preview {
    height: fit-content;
  }

  &__content {
    display: grid;
    grid-template-columns: 8fr 4fr;
    gap: $unnnic-spacing-sm;
    overflow: auto;
    height: 100%;
  }

  &__variables-list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__item-label {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
