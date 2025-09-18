<!-- eslint-disable vue/no-v-html -->
<template>
  <UnnnicModalDialog
    class="contact-import-upload-instructions-modal"
    :modelValue="open"
    :title="$t('modals.contact_import_upload_instructions.title')"
    size="lg"
    showCloseIcon
    showActionsDivider
    @update:model-value="handleModalUpdate"
  >
    <section class="contact-import-upload-instructions-modal__content">
      <h2
        class="contact-import-upload-instructions-modal__subtitle"
        data-test="subtitle-1"
      >
        {{ $t('modals.contact_import_upload_instructions.subtitle') }}
      </h2>
      <ul
        class="contact-import-upload-instructions-modal__list"
        data-test="instructions-list"
      >
        <li
          v-for="instruction in instructions"
          :key="instruction"
          class="contact-import-upload-instructions-modal__list-item"
          data-test="instructions-item"
          v-html="instruction"
        ></li>
      </ul>
      <h2
        class="contact-import-upload-instructions-modal__subtitle"
        data-test="subtitle-2"
      >
        {{ $t('modals.contact_import_upload_instructions.subtitle_2') }}
      </h2>
      <UnnnicDataTable
        v-model:page="page"
        :headers="headers"
        :items="items"
        fixedHeaders
        :hidePagination="true"
      />
      <footer class="contact-import-upload-instructions-modal__footer">
        <I18nT
          class="contact-import-upload-instructions-modal__footer-title"
          keypath="modals.contact_import_upload_instructions.footer.title"
          tag="span"
        >
          <button
            class="contact-import-upload-instructions-modal__footer-title-highlight"
            data-test="download-sample"
            @click="handleDownloadSample"
          >
            {{
              $t(
                'modals.contact_import_upload_instructions.footer.title_highlight',
              )
            }}
          </button>
        </I18nT>
      </footer>
    </section>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['update:open']);

const page = ref(0);

const instructions = [
  t('modals.contact_import_upload_instructions.list.item_1'),
  t('modals.contact_import_upload_instructions.list.item_2'),
  t('modals.contact_import_upload_instructions.list.item_3'),
  t('modals.contact_import_upload_instructions.list.item_4'),
  t('modals.contact_import_upload_instructions.list.item_5'),
];

const headers = [
  {
    title: t('modals.contact_import_upload_instructions.table.header_1'),
    itemKey: 'column_header',
    sortable: false,
  },
  {
    title: t('modals.contact_import_upload_instructions.table.header_2'),
    itemKey: 'description',
    sortable: false,
  },
  {
    title: t('modals.contact_import_upload_instructions.table.header_3'),
    itemKey: 'example',
    sortable: false,
  },
];

const items = [
  {
    column_header: t(
      'modals.contact_import_upload_instructions.table.header_label.name',
    ),
    description: t(
      'modals.contact_import_upload_instructions.table.header_description.name',
    ),
    example: t(
      'modals.contact_import_upload_instructions.table.header_example.name',
    ),
  },
  {
    column_header: t(
      'modals.contact_import_upload_instructions.table.header_label.urn_tel',
    ),
    description: t(
      'modals.contact_import_upload_instructions.table.header_description.urn_tel',
    ),
    example: '+554733333333',
  },
  {
    column_header: t(
      'modals.contact_import_upload_instructions.table.header_label.urn_whatsapp',
    ),
    description: t(
      'modals.contact_import_upload_instructions.table.header_description.urn_whatsapp',
    ),
    example: '+5511999999999',
  },
  {
    column_header: t(
      'modals.contact_import_upload_instructions.table.header_label.field_team',
    ),
    description: t(
      'modals.contact_import_upload_instructions.table.header_description.field_team',
    ),
    example: t(
      'modals.contact_import_upload_instructions.table.header_example.field_team',
    ),
  },
];

const handleModalUpdate = (value: boolean) => {
  emit('update:open', value);
};

const handleDownloadSample = () => {
  const link = 'https://flows.weni.ai/sitestatic/examples/sample_import.xlsx';
  window.open(link, '_blank');
};
</script>

<style lang="scss" scoped>
.contact-import-upload-instructions-modal {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__subtitle {
    @include unnnic-text-body-lg;
    color: $unnnic-color-neutral-dark;
    font-weight: $unnnic-font-weight-bold;
  }

  &__list {
    list-style: outside;
  }

  &__list-item {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-cloudy;
    margin-left: $unnnic-font-size-title-sm;

    :deep(.bold) {
      font-weight: $unnnic-font-weight-bold;
    }
  }

  &__list-item::marker {
    margin-inline-end: $unnnic-spacing-xs;
  }

  &__footer-title {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-cloudy;
  }

  &__footer-title-highlight {
    @include unnnic-text-body-gt;
    @include button-reset;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-cloudy;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
