<template>
  <table class="metrics-table">
    <tr class="metrics-table__row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <td :class="`metrics-table__cell metrics-table__cell${sizeModifier}`" v-for="(cell, cellIndex) in row"
        :key="cellIndex">
        <section :class="`metrics-table__cell-content metrics-table__cell-content${sizeModifier}`">
          <section class="metrics-table__label-container">
            <p :class="`metrics-table__label metrics-table__label${sizeModifier}`">{{ cell.label }}</p>
            <section :class="[`metrics-table__tooltip${cellNearModifier(cell)}`]">
              <UnnnicToolTip v-if="cell.hint" :text="cell.hint" :side="tooltipSide(cellIndex)" :maxWidth="'300px'"
                enabled>
                <UnnnicIcon icon="info" scheme="neutral-cleanest" size="nano" filled />
              </UnnnicToolTip>
            </section>
            <section class="metrics-table__actions" v-if="cell.actions && cell.actions.length > 0">
              <UnnnicDropdown class="metrics-table__dropdown">
                <template #trigger>
                  <UnnnicIcon icon="more_vert" size="ant" scheme="neutral-cloudy" />
                </template>

                <UnnnicDropdownItem class="metrics-table__dropdown-item" v-for="(action, index) in cell.actions"
                  :key="index" @click="action.onClick">
                  <UnnnicIcon :icon="action.icon" size="sm" scheme="neutral-dark" />
                  <p class="metrics-table__dropdown-label">{{ action.label }}</p>
                </UnnnicDropdownItem>
              </UnnnicDropdown>
            </section>
          </section>
          <section :class="`metrics-table__values-container metrics-table__values-container${sizeModifier}`">
            <p :class="`metrics-table__value metrics-table__value${sizeModifier}`">
              {{ cell.value }}
            </p>

            <p v-if="cell.subValue" :class="`metrics-table__sub-value metrics-table__sub-value${sizeModifier}`">
              {{ cell.subValue }}
            </p>
          </section>
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
  subValue?: string
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

const sizeModifier = computed(() => {
  return props.size === 'sm' ? '--sm' : ''
})

const cellNearModifier = (cell: MetricsTableItem): string => {
  return props.nearTooltip || cell.actions?.length ? '--near' : ''
}

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
  if (props.nearTooltip) {
    return 'top'
  }

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

  &__row:last-child {
    .metrics-table__cell {
      border-bottom: none;
    }
  }

  &__cell {
    border-right: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    padding: $unnnic-spacing-md;

    &:last-child {
      border-right: none;
    }

    &--sm {
      padding: $unnnic-spacing-sm;
    }
  }

  &__cell-content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;

    &--sm {
      gap: $unnnic-spacing-nano;
    }
  }

  &__label-container {
    display: flex;
    gap: $unnnic-spacing-xs;
  }

  &__label {
    overflow: hidden;
    color: $unnnic-color-neutral-darkest;
    text-overflow: ellipsis;

    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

    &--sm {
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }
  }

  &__tooltip {
    display: flex;
    align-items: end;
    justify-content: center;
    margin-left: auto;
    cursor: default;

    &--near {
      margin-left: unset;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;

    cursor: pointer;
  }

  &__dropdown-item {
    display: flex;
    width: max-content;
    gap: $unnnic-spacing-xs;
    align-items: center;
  }

  &__values-container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  &__value {
    color: $unnnic-color-neutral-black;

    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;

    &--sm {
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  &__sub-value {
    display: flex;
    align-items: center;

    color: $unnnic-color-neutral-cloudy;

    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    &--sm {
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }

    &::before {
      content: '';
      display: block;
      width: $unnnic-border-width-thinner;
      height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      background-color: $unnnic-color-neutral-soft;
      margin: 0 $unnnic-spacing-xs;
    }
  }
}
</style>
