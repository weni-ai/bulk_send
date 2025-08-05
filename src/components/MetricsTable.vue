<template>
  <table class="metrics-table">
    <tr class="metrics-table__row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <td class="metrics-table__row__cell" v-for="(cell, cellIndex) in row" :key="cellIndex">
        <section class="metrics-table__row__cell__content">
          <section class="metrics-table__row__cell__content__label-container">
            <p class="metrics-table__row__cell__content__label-container__label">{{ cell.label }}</p>
            <section
              :class="['metrics-table__row__cell__content__label-container__tooltip', { 'tooltip-near': nearTooltip || cell.actions?.length }]">
              <UnnnicToolTip v-if="cell.hint" :text="cell.hint" :side="tooltipSide(cellIndex)" :maxWidth="'300px'"
                enabled>
                <UnnnicIcon icon="info" scheme="neutral-cleanest" size="nano" filled />
              </UnnnicToolTip>
            </section>
            <section class="metrics-table__row__cell__content__actions" v-if="cell.actions && cell.actions.length > 0">
              <UnnnicDropdown class="metrics-table__row__cell__content__actions__dropdown">
                <template #trigger>
                  <UnnnicIcon icon="more_vert" size="ant" scheme="neutral-cloudy" />
                </template>

                <UnnnicDropdownItem class="metrics-table__row__cell__content__actions__dropdown__item"
                  v-for="(action, index) in cell.actions" :key="index" @click="action.onClick">
                  <UnnnicIcon :icon="action.icon" size="sm" scheme="neutral-dark" />
                  <p class="metrics-table__row__cell__content__actions__dropdown__item__label">{{ action.label }}</p>
                </UnnnicDropdownItem>
              </UnnnicDropdown>
            </section>
          </section>
          <p class="metrics-table__row__cell__content__value">{{ cell.value }}</p>
        </section>
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MetricsTableItem {
  label: string
  value: string
  hint?: string
  actions?: Array<{
    label: string
    icon: string
    onClick: () => void
  }>
}

const props = defineProps({
  maxColumns: {
    type: Number,
    required: true,
  },
  data: {
    type: Array<MetricsTableItem>,
    required: true,
  },
  nearTooltip: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md'].includes(value),
  },
})

const rows = computed(() => {
  return props.data.reduce((acc, item, index) => {
    if (index % props.maxColumns === 0) {
      acc.push([item])
    } else {
      acc[acc.length - 1].push(item)
    }
    return acc
  }, [] as MetricsTableItem[][])
})

const tooltipSide = (cellIndex: number) => {
  if (cellIndex % props.maxColumns === 0) {
    return 'right'
  }

  if (cellIndex % props.maxColumns === props.maxColumns - 1) {
    return 'left'
  }

  return 'top'
}
</script>

<style scoped lang="scss">
.metrics-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;

  &__row {
    &__cell {
      border-right: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      padding: $unnnic-spacing-md;

      &:last-child {
        border-right: none;
      }

      &__content {
        display: flex;
        flex-direction: column;
        gap: $unnnic-spacing-xs;

        &__label-container {
          display: flex;
          gap: $unnnic-spacing-xs;

          &__label {
            overflow: hidden;
            color: $unnnic-color-neutral-darkest;
            text-overflow: ellipsis;

            font-size: $unnnic-font-size-body-lg;
            line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
          }

          &__tooltip {
            display: flex;
            align-items: end;
            justify-content: center;
            margin-left: auto;

            cursor: default;
          }

          &__tooltip-near {
            margin-left: unset;
          }

          &__actions {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;

            cursor: pointer;

            &__dropdown {
              &__item {
                display: flex;
                width: max-content;
                gap: $unnnic-spacing-xs;
                align-items: center;
              }
            }
          }
        }

        &__value {
          color: $unnnic-color-neutral-black;

          font-size: $unnnic-font-size-title-md;
          line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-bold;
        }
      }
    }

    &:last-child {
      .metrics-table__row__cell {
        border-bottom: none;
      }
    }
  }
}
</style>
