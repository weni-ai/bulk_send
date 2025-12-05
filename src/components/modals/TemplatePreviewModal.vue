<template>
  <UnnnicModalDialog
    class="template-preview-modal"
    :modelValue="modelValue"
    :title="$t('modals.template_preview.title')"
    showCloseIcon
    showActionsDivider
    @update:model-value="handleUpdateModelValue"
  >
    <section
      v-if="loading"
      class="template-preview-modal__loading"
      data-test="group-list-loading"
    >
      <img
        :src="weniLoading"
        width="40"
        height="40"
      />
    </section>
    <UnnnicTemplatePreview
      v-else
      class="template-preview-modal__preview"
      :template="template"
    />
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useTemplatesStore } from '@/stores/templates';
import { formatTemplateToPreview } from '@/utils/templates';
import weniLoading from '@/assets/images/weni-loading.svg';
import type { TemplatePreview } from '@/types/template';

const templatesStore = useTemplatesStore();

const template = ref<TemplatePreview | null>(null);
const loading = ref(false);

const props = defineProps<{
  modelValue: boolean;
  templateId: number;
}>();

const emit = defineEmits(['update:modelValue']);

onBeforeMount(() => {
  loading.value = true;
  templatesStore
    .getTemplate(props.templateId)
    .then((response) => {
      template.value = formatTemplateToPreview(response.data);
    })
    .finally(() => {
      loading.value = false;
    });
});

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};
</script>

<style scoped lang="scss">
.template-preview-modal {
  :deep(.unnnic-modal-dialog__container__content) {
    background-color: $unnnic-color-background-lightest;
  }

  &__preview {
    margin: 0 auto;
  }
}
</style>
