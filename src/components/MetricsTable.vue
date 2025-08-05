<template>
  <table class="metrics-table">
    <tr class="row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <td class="cell" v-for="(cell, cellIndex) in row" :key="cellIndex">
        <section class="content">
          <section class="label-container">
            <p class="label">{{ cell.label }}</p>
            <section :class="['tooltip', { 'tooltip-near': nearTooltip || cell.actions?.length }]">
              <UnnnicToolTip v-if="cell.hint" :text="cell.hint" :side="tooltipSide(cellIndex)" :maxWidth="'300px'"
                enabled>
                <UnnnicIcon icon="info" scheme="neutral-cleanest" size="nano" filled />
              </UnnnicToolTip>
            </section>
            <section class="actions" v-if="cell.actions && cell.actions.length > 0">
              <UnnnicDropdown class="action_dropdown">
                <template #trigger>
                  <UnnnicIcon icon="more_vert" size="ant" scheme="neutral-cloudy" />
                </template>

                <UnnnicDropdownItem v-for="(action, index) in cell.actions" :key="index" class="action_dropdown_item"
                  @click="action.onClick">
                  <UnnnicIcon :icon="action.icon" size="sm" scheme="neutral-dark" />
                  <p class="action_label">{{ action.label }}</p>
                </UnnnicDropdownItem>
              </UnnnicDropdown>
            </section>
          </section>
          <p class="value">{{ cell.value }}</p>
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
  border-spacing: 0;
  table-layout: fixed;

  & .row {
    & .cell {
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      padding: $unnnic-spacing-md;

      & .content {
        display: flex;
        flex-direction: column;
        gap: $unnnic-spacing-xs;

        & .label-container {
          display: flex;
          gap: $unnnic-spacing-xs;

          & .label {
            overflow: hidden;
            color: $unnnic-color-neutral-darkest;
            text-overflow: ellipsis;

            font-size: $unnnic-font-size-body-lg;
            line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
          }

          & .tooltip {
            display: flex;
            align-items: end;
            justify-content: center;
            margin-left: auto;

            cursor: default;
          }

          & .tooltip-near {
            margin-left: unset;
          }

          & .actions {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;

            cursor: pointer;

            & .action_dropdown {
              & .action_dropdown_item {
                display: flex;
                width: max-content;
                gap: $unnnic-spacing-xs;
                align-items: center;
              }
            }
          }
        }

        & .value {
          color: $unnnic-color-neutral-black;

          font-size: $unnnic-font-size-title-md;
          line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-bold;
        }
      }
    }

    &:first-child {
      & .cell:first-child {
        border-top-left-radius: $unnnic-border-radius-md;
      }

      & .cell:last-child {
        border-top-right-radius: $unnnic-border-radius-md;
      }
    }

    &:last-child {
      & .cell:first-child {
        border-bottom-left-radius: $unnnic-border-radius-md;
      }

      & .cell:last-child {
        border-bottom-right-radius: $unnnic-border-radius-md;
      }
    }
  }
}
</style>
