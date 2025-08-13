<template>
  <UnnnicModalDialog
    :model-value="modelValue"
    @update:model-value="handleUpdateModelValue"
    @primaryButtonClick="handlePrimaryButtonClick"
    @secondaryButtonClick="handleSecondaryButtonClick"
    :primary-button-props="{
      text: $t('modals.activate_mmlite.buttons.primary'),
    }"
    :secondary-button-props="{
      text: $t('modals.activate_mmlite.buttons.secondary'),
    }"
    :title="$t('modals.activate_mmlite.title')"
    size="lg"
    showActionsDivider
    showCloseIcon
  >
    <section class="activate-mmlite-modal__content">
      <h2 class="activate-mmlite-modal__subtitle">
        {{ $t('modals.activate_mmlite.main_subtitle') }}
      </h2>
      <i18n-t
        class="activate-mmlite-modal__description"
        keypath="modals.activate_mmlite.main_description.text"
        tag="p"
      >
        <b class="activate-mmlite-modal__description--bold">
          {{ $t('modals.activate_mmlite.main_description.bold_text') }}
        </b>
      </i18n-t>
      <h2 class="activate-mmlite-modal__subtitle">
        {{ $t('modals.activate_mmlite.why_subtitle') }}
      </h2>
      <section class="activate-mmlite-modal__section">
        <h3 class="activate-mmlite-modal__label">
          {{ $t('modals.activate_mmlite.more_messages_label') }}
        </h3>
        <p class="activate-mmlite-modal__description">
          {{ $t('modals.activate_mmlite.more_messages_description') }}
        </p>
      </section>
      <section class="activate-mmlite-modal__section">
        <h3 class="activate-mmlite-modal__label">
          {{ $t('modals.activate_mmlite.engagement_label') }}
        </h3>
        <p class="activate-mmlite-modal__description">
          {{ $t('modals.activate_mmlite.engagement_description') }}
        </p>
      </section>
      <section class="activate-mmlite-modal__section">
        <h3 class="activate-mmlite-modal__label">
          {{ $t('modals.activate_mmlite.seamless_label') }}
        </h3>
        <p class="activate-mmlite-modal__description">
          {{ $t('modals.activate_mmlite.seamless_description') }}
        </p>
      </section>
      <i18n-t
        class="activate-mmlite-modal__footer"
        keypath="modals.activate_mmlite.footer.text"
        tag="footer"
      >
        <a
          href="https://developers.facebook.com/docs/whatsapp/marketing-messages-lite-api"
          target="_blank"
          class="activate-mmlite-modal__footer--link"
        >
          {{ $t('modals.activate_mmlite.footer.link') }}
        </a>
      </i18n-t>
    </section>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}

const handlePrimaryButtonClick = () => {
  console.log('primary button clicked')
}

const handleSecondaryButtonClick = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.activate-mmlite-modal {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
  }

  &__subtitle {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__label {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__description {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    &--bold {
      font-weight: $unnnic-font-weight-bold;
    }
  }

  &__footer {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    &--link {
      color: $unnnic-color-neutral-cloudy;
      text-decoration: none;
      text-decoration-line: underline;
      text-decoration-style: solid;
      text-decoration-skip-ink: none;
      text-decoration-thickness: auto;
      text-underline-offset: auto;
      text-underline-position: from-font;
    }
  }
}
</style>
