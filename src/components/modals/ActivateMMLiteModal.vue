<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :primaryButtonProps="{
      text: $t('modals.activate_mmlite.buttons.primary'),
      loading: isMMLiteLoading,
    }"
    :secondaryButtonProps="{
      text: $t('modals.activate_mmlite.buttons.secondary'),
    }"
    :title="$t('modals.activate_mmlite.title')"
    size="lg"
    showActionsDivider
    showCloseIcon
    @update:model-value="handleUpdateModelValue"
    @primary-button-click="activateMMLite"
    @secondary-button-click="handleSecondaryButtonClick"
  >
    <section class="activate-mmlite-modal__content">
      <p class="activate-mmlite-modal__description">
        {{ $t('modals.activate_mmlite.description') }}
      </p>

      <h2 class="activate-mmlite-modal__subtitle">
        {{ $t('modals.activate_mmlite.why_subtitle') }}
      </h2>

      <section class="activate-mmlite-modal__section">
        <h3 class="activate-mmlite-modal__label">
          {{ $t('modals.activate_mmlite.more_messages_label') }}
        </h3>
        <I18nT
          class="activate-mmlite-modal__description"
          keypath="modals.activate_mmlite.more_messages_description.text"
          tag="p"
        >
          <b class="activate-mmlite-modal__description--bold">
            {{
              $t('modals.activate_mmlite.more_messages_description.bold_text')
            }}
          </b>
        </I18nT>
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
        <I18nT
          class="activate-mmlite-modal__description"
          keypath="modals.activate_mmlite.seamless_description.text"
          tag="p"
        >
          <b class="activate-mmlite-modal__description--bold">
            {{ $t('modals.activate_mmlite.seamless_description.bold_text') }}
          </b>
        </I18nT>
      </section>

      <div class="activate-mmlite-modal__footer-content">
        <I18nT
          class="activate-mmlite-modal__footer-info"
          keypath="modals.activate_mmlite.footer.text"
          tag="p"
        >
          <a
            href="https://developers.facebook.com/docs/whatsapp/marketing-messages-lite-api"
            target="_blank"
            class="activate-mmlite-modal__footer-info--link"
          >
            {{ $t('modals.activate_mmlite.footer.link') }}
          </a>
        </I18nT>

        <UnnnicCheckbox
          v-model="doNotRemind"
          :textRight="$t('modals.activate_mmlite.do_not_remind')"
          size="sm"
        />
      </div>
    </section>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import unnnic from '@weni/unnnic-system';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { initFacebookSdk } from '@/utils/plugins/fb';
import { moduleStorage } from '@/utils/storage';
import env from '@/utils/env';
import { MMLITE_DO_NOT_REMIND_KEY } from '@/constants/storage';
const { t } = useI18n();

defineProps<{
  modelValue: boolean;
}>();

const isMMLiteLoading = ref(false);
const doNotRemind = ref(false);

const emit = defineEmits(['update:modelValue']);

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

const handleSecondaryButtonClick = () => {
  if (doNotRemind.value) {
    moduleStorage.setItem(MMLITE_DO_NOT_REMIND_KEY, 'true');
  }
  emit('update:modelValue', false);
};

const activateMMLite = () => {
  const fbAppId = env('WHATSAPP_FACEBOOK_APP_ID');
  const configId = env('WHATSAPP_MMLITE_CONFIG_ID');

  const callback = () => {
    isMMLiteLoading.value = true;

    // @ts-expect-error - FB is not defined in the editor but will be defined since is a callback after initFacebookSdk
    // eslint-disable-next-line no-undef
    FB.login(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (response: any) {
        isMMLiteLoading.value = false;
        if (response.authResponse) {
          unnnic.unnnicCallAlert({
            props: {
              text: t('modals.activate_mmlite.success_alert'),
              type: 'success',
            },
            seconds: 5,
          });
        } else {
          unnnic.unnnicCallAlert({
            props: {
              text: t('modals.activate_mmlite.error_alert'),
              type: 'error',
            },
            seconds: 10,
          });
        }
        emit('update:modelValue', false);
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { features: [{ name: 'marketing_messages_lite' }] },
      },
    );
  };

  initFacebookSdk(fbAppId, callback);
};
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
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__label {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;
  }

  &__description {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;
  }

  &__footer-content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__footer-info {
    color: $unnnic-color-fg-base;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    &--link {
      color: $unnnic-color-fg-base;
      text-decoration: underline;
      font-weight: $unnnic-font-weight-medium;
      cursor: pointer;
    }
  }
}
</style>
