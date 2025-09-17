<template>
  <section
    class="template-selection-preview"
    data-test="template-preview"
  >
    <header
      class="template-selection-preview__header"
      data-test="template-preview-header"
    >
      <h1
        v-if="!selectedTemplate"
        class="template-selection-preview__name"
        data-test="template-preview-title"
      >
        {{ $t('new_broadcast.pages.select_template.preview.title') }}
      </h1>
      <h1
        v-else
        class="template-selection-preview__name"
        data-test="template-preview-name"
      >
        {{ $t('new_broadcast.pages.select_template.preview.name') }}
        <span
          class="template-selection-preview__name-value"
          data-test="template-preview-name-value"
        >
          {{ selectedTemplate.name }}
        </span>
      </h1>
    </header>
    <section
      :class="{
        'template-selection-preview__content': true,
        'template-selection-preview__content--selected': selectedTemplate,
      }"
      data-test="template-preview-content"
    >
      <p
        v-if="!selectedTemplate"
        class="template-selection-preview__missing"
        data-test="template-preview-missing"
      >
        {{ $t('new_broadcast.pages.select_template.preview.missing') }}
      </p>
      <UnnnicTemplatePreview
        v-else
        class="template-selection-preview__content-preview"
        data-test="template-preview-component"
        :template="selectedTemplate"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { formatTemplateToPreview } from '@/utils/templates';

const props = defineProps<{
  variablesToReplace?: (string | undefined)[];
}>();

const broadcastsStore = useBroadcastsStore();

const selectedTemplate = computed(() => {
  if (!broadcastsStore.newBroadcast.selectedTemplate) {
    return null;
  }

  const selectedTemplate = broadcastsStore.newBroadcast.selectedTemplate;

  return formatTemplateToPreview(selectedTemplate, bodyFormatter);
});

const bodyFormatter = (body: string) => {
  let newBody = body.replace(/{{(\d+)}}/g, '*{{$1}}*');

  if (props.variablesToReplace && props.variablesToReplace.length > 0) {
    props.variablesToReplace.forEach((variable, index) => {
      if (variable) {
        newBody = newBody.replace(`{{${index + 1}}}`, variable);
      }
    });
  }

  return newBody;
};
</script>

<style scoped lang="scss">
.template-selection-preview {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  min-height: 432px; // fixed height as set in the design
  width: 409px; // fixed width as set in the design
  height: fit-content;
  &__header {
    display: flex;
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;
  }

  &__name {
    @include unnnic-text-body-gt;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__name-value {
    font-weight: $unnnic-font-weight-regular;
  }

  &__content {
    display: flex;
    flex: 1;
    padding: $unnnic-spacing-sm;
    background-color: $unnnic-color-background-lightest;
    justify-content: center;
  }

  &__content--selected {
    align-items: center;
  }

  &__missing {
    display: flex;
    flex: 1;
    background-color: $unnnic-color-background-white;
    border-radius: $unnnic-border-radius-md;
    align-items: center;
    justify-content: center;
    box-shadow: $unnnic-shadow-level-near;

    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-cloudy;
  }

  &__content-preview {
    :deep(strong) {
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-dark;
    }

    :deep(i) {
      font-style: italic;
    }

    :deep(tt) {
      font-family: monospace;
    }
  }
}
</style>
