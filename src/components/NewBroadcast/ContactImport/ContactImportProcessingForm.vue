<template>
  <section class="contact-import-processing-form">
    <h1 class="contact-import-processing-form__title">
      {{ $t('new_broadcast.pages.contact_import.processing.form.title') }}
    </h1>

    <section class="contact-import-processing-form__action-type">
      <UnnnicRadio
        v-for="option in actionTypeOptions"
        :key="option"
        :value="option"
        :modelValue="actionType"
        @update:model-value="handleActionTypeUpdate"
      >
        {{ option }}
      </UnnnicRadio>
    </section>

    <section class="contact-import-processing-form__group">
      <section
        v-if="actionType === ActionType.CREATE"
        class="contact-import-processing-form__group-name"
      >
        <label class="contact-import-processing-form__group-label">
          {{
            $t(
              'new_broadcast.pages.contact_import.processing.form.group_name.label',
            )
          }}
        </label>
        <UnnnicInput
          size="sm"
          :modelValue="groupName"
          :placeholder="
            $t(
              'new_broadcast.pages.contact_import.processing.form.group_name.placeholder',
            )
          "
          @update:model-value="handleGroupNameUpdate"
        />
      </section>

      <section
        v-if="actionType === ActionType.ADD"
        class="contact-import-processing-form__group-select"
      >
        <label class="contact-import-processing-form__group-label">
          {{
            $t(
              'new_broadcast.pages.contact_import.processing.form.group_select.label',
            )
          }}
        </label>
        <UnnnicSelectSmart
          :modelValue="groupOption"
          :options="groups"
          :isLoading="loadingGroups"
          size="sm"
          autocomplete
          autocompleteClearOnFocus
          autocompleteIconLeft
          @update:model-value="handleGroupSelectUpdate"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGroupsStore } from '@/stores/groups';
import type { SelectOption } from '@/types/select';
import { useContactImportStore } from '@/stores/contactImport';
import { ContactImportGroupMode } from '@/types/contactImport';

const { t } = useI18n();

const groupsStore = useGroupsStore();
const contactImportStore = useContactImportStore();

const groupName = computed(() => {
  return contactImportStore.importProcessing?.groupName;
});
const group = computed(() => {
  return contactImportStore.importProcessing?.group;
});

const loadingGroups = computed(() => {
  return groupsStore.loadingGroups;
});

const ActionType: Record<string, string> = {
  CREATE: t(
    'new_broadcast.pages.contact_import.processing.form.action_type.create',
  ),
  ADD: t('new_broadcast.pages.contact_import.processing.form.action_type.add'),
};

const actionType = ref(ActionType.CREATE);
const actionTypeOptions = Object.values(ActionType);

const groupOption = computed<SelectOption[]>(() => {
  if (group.value) {
    return [
      {
        label: group.value.name,
        value: group.value.id.toString(),
      },
    ];
  }

  return [];
});

const groups = computed<SelectOption[]>(() => {
  const options = [
    {
      label: t(
        'new_broadcast.pages.contact_import.processing.form.group_select.placeholder',
      ),
      value: '',
    },
    ...groupsStore.groups.map((group) => ({
      label: group.name,
      value: group.id.toString(),
    })),
  ];

  return options;
});

const clearAll = () => {
  handleGroupSelectUpdate([]);
  handleGroupNameUpdate('');
};

const handleActionTypeUpdate = (value: string) => {
  actionType.value = value;
  clearAll();

  if (value === ActionType.IMPORT_WITHOUT_ADDING) {
    contactImportStore.setProcessingAddToGroup(false);
  } else {
    contactImportStore.setProcessingAddToGroup(true);
    if (value === ActionType.CREATE) {
      contactImportStore.setProcessingGroupMode(ContactImportGroupMode.NEW);
    } else if (value === ActionType.ADD) {
      contactImportStore.setProcessingGroupMode(
        ContactImportGroupMode.EXISTING,
      );
    }
  }
};

const handleGroupNameUpdate = (value: string) => {
  contactImportStore.setProcessingGroupName(value);
};

const handleGroupSelectUpdate = (value: SelectOption[]) => {
  if (value.length === 0) {
    contactImportStore.setProcessingGroup(undefined);
    return;
  }

  const selectedGroup = value[0];
  const group = groupsStore.groups.find(
    (group) => group.id === Number(selectedGroup.value),
  );
  contactImportStore.setProcessingGroup(group);
};
</script>

<style lang="scss" scoped>
.contact-import-processing-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__group {
    width: 33%;
  }

  &__group-label {
    @include unnnic-text-body-gt;
  }

  &__group-name,
  &__group-select {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }
}
</style>
