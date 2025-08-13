import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import RecentSends from '@/components/HomeBulkSend/RecentSends.vue'
import type { RecentSend } from '@/types/recentSends'

// Define the component's exposed interface for testing
interface RecentSendsComponentInstance {
  search: string
  dateRange: { start: string; end: string }
  recentSendsData: RecentSend[]
}

const stubs = {
  MissingRecentSends: {
    emits: ['start-new-send'],
    template:
      '<div class="missing-recent-sends-stub" @click="$emit(\'start-new-send\')">Missing Recent Sends</div>',
  },
  RecentSendsList: {
    props: ['recentSends'],
    template:
      '<div class="recent-sends-list-stub">RecentSendsList Stub - {{ recentSends.length }}</div>',
  },
  UnnnicInput: {
    props: ['placeholder', 'modelValue', 'iconLeft'],
    emits: ['update:modelValue'],
    template:
      '<input class="unnnic-input-stub" :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  UnnnicInputDatePicker: {
    props: ['placeholder', 'modelValue'],
    emits: ['update:modelValue'],
    template:
      '<input class="unnnic-date-picker-stub" :placeholder="placeholder" @change="$emit(\'update:modelValue\', { start: \'2024-01-01\', end: \'2024-01-31\' })" />',
  },
}

const mountWrapper = (props = {}): VueWrapper<RecentSendsComponentInstance> => {
  return mount(RecentSends, {
    props,
    global: {
      mocks: {
        $t: () => 'stubbed text',
      },
      stubs,
    },
  }) as VueWrapper<RecentSendsComponentInstance>
}

describe('RecentSends.vue', () => {
  it('should render the component correctly', () => {
    const wrapper = mountWrapper()

    expect(wrapper.find('.recent-sends').exists()).toBe(true)
    expect(wrapper.find('.recent-sends__title').exists()).toBe(true)
  })

  it('should show MissingRecentSends when no data exists', () => {
    const wrapper = mountWrapper()

    expect(wrapper.find('.missing-recent-sends-stub').exists()).toBe(true)
    expect(wrapper.find('.recent-sends__content').exists()).toBe(false)
  })

  it('should handle search input updates', async () => {
    const wrapper = mountWrapper()

    // Add data first to show filters
    await wrapper.find('.missing-recent-sends-stub').trigger('click')

    const searchInput = wrapper.find('.unnnic-input-stub')
    await searchInput.setValue('test search')
    await searchInput.trigger('input')

    // Verify the component's reactive search value was updated
    expect(wrapper.vm.search).toBe('test search')
  })

  it('should handle date range updates', async () => {
    const wrapper = mountWrapper()

    // Add data first to show filters
    await wrapper.find('.missing-recent-sends-stub').trigger('click')

    const datePicker = wrapper.find('.unnnic-date-picker-stub')
    await datePicker.trigger('change')

    // Verify the component handles the date range update
    expect(wrapper.vm.dateRange).toEqual({ start: '2024-01-01', end: '2024-01-31' })
  })

  it('should list recent sends', async () => {
    const wrapper = mountWrapper()

    // TODO: when API is ready, change how data is fetched
    // Add data first to show filters
    await wrapper.find('.missing-recent-sends-stub').trigger('click')

    expect(wrapper.find('.recent-sends-list-stub').exists()).toBe(true)
  })
})
