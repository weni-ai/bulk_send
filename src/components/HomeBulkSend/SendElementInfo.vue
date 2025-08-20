<template>
  <section
    class="send-element-info"
    data-test="send-element-info"
  >
    <h2 class="send-element-info__title">
      {{ $t('home.recent_sends.info.title') }}
    </h2>
    <section class="send-element-info__content">
      <section class="send-element-info__dates">
        <section
          class="send-element-info__started-on send-element-info__value-container"
        >
          <p class="send-element-info__label">
            {{ $t('home.recent_sends.info.started_on') }}
          </p>
          <p class="send-element-info__value">
            {{ startedOn }}
          </p>
        </section>
        <section class="send-element-info__value-container">
          <p class="send-element-info__label">
            {{ $t('home.recent_sends.info.ended_on') }}
          </p>
          <p class="send-element-info__value">
            {{ endedOn }}
          </p>
        </section>
      </section>
      <section class="send-element-info__value-container">
        <p class="send-element-info__label">
          {{ $t('home.recent_sends.info.template_name') }}
        </p>
        <p class="send-element-info__value">
          {{ templateName }}
          <button
            class="send-element-info__view-template"
            data-test="view-template"
            @click="handleViewTemplate"
          >
            {{ $t('home.recent_sends.metrics.actions.view_template') }}
          </button>
        </p>
      </section>
      <section class="send-element-info__value-container">
        <p class="send-element-info__label">
          {{ $t('home.recent_sends.info.groups') }}
        </p>
        <p class="send-element-info__value">
          {{ groups }}
        </p>
      </section>
      <section class="send-element-info__value-container">
        <p class="send-element-info__label">
          {{ $t('home.recent_sends.info.sent_by') }}
        </p>
        <p class="send-element-info__value">
          {{ send.createdBy }}
        </p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { BroadcastStatistic } from '@/types/broadcast';
import { BroadcastStatus } from '@/constants/broadcasts';
import { formatDateWithTimezone } from '@/utils/date';
import { computed } from 'vue';

const DATE_FORMAT = '[MMM d, h:mm aa]';

const props = defineProps<{
  send: BroadcastStatistic;
}>();

const startedOn = computed(() => {
  return formatDateWithTimezone(props.send.createdOn, DATE_FORMAT);
});

// TODO: check if ended on will be calculated by the backend
const endedOn = computed(() => {
  if (props.send.status === BroadcastStatus.SENT) {
    return formatDateWithTimezone(props.send.modifiedOn, DATE_FORMAT);
  }

  return '-';
});

const templateName = computed(() => {
  return props.send.template?.name || '-';
});

const groups = computed(() => {
  return props.send.groups.join(', ');
});

const handleViewTemplate = () => {
  console.log('view template');
};
</script>

<style scoped lang="scss">
// TODO: fix this component width and overflow behavior, on small screens an unwanted overflow is occurring
.send-element-info {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-ant;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }

  &__label {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__value {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__dates {
    display: flex;
    flex-direction: row;
    gap: $unnnic-spacing-nano;
  }

  &__value-container {
    display: flex;
    flex-direction: row;
    gap: $unnnic-spacing-nano;
    white-space: nowrap;
  }

  &__started-on::after {
    content: '–';
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__view-template {
    color: $unnnic-color-neutral-cloudy;
    font-family: Lato;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    text-decoration-line: underline;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    margin-left: $unnnic-spacing-nano;
  }
}
</style>
