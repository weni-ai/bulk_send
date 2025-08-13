import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import HomeBulkSend from '@/views/BulkSend/HomeBulkSend.vue'

// Mock i18n
const $t = vi.fn((key) => key)

describe('HomeBulkSend.vue', () => {
  const getStubs = () => ({
    BulkSendHomeLayout: {
      template: '<div><slot name="header" /><slot name="content" /></div>',
    },
    HomeHeader: true,
    MetricsTable: true,
    RecentSends: true,
    ActivateMMLiteModal: {
      template: '<div class="activate-mmlite-modal" />',
    },
    UnnnicDisclaimer: {
      template:
        '<div class="home-bulk-send__mmlite-disclaimer" @click="$emit(\'click\', $event)"><button class="show-more-button" @click="$emit(\'click\', $event)">Show more</button></div>',
      emits: ['click'],
    },
    UnnnicButton: {
      template: '<button class="unnnic-button-stub" @click="$emit(\'click\')"></button>',
      emits: ['click'],
    },
    UnnnicInputDatePicker: {
      template:
        "<input class=\"unnnic-input-date-picker-stub\" @change=\"$emit('update:modelValue', { start: '2024-01-01', end: '2024-01-31' })\" />",
      emits: ['update:modelValue'],
    },
    UnnnicInput: {
      template:
        '<input class="unnnic-input-stub" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
  })

  const mountWrapper = () =>
    mount(HomeBulkSend, {
      global: {
        mocks: { $t },
        stubs: getStubs(),
      },
    })

  it('should NOT open the modal when the disclaimer container is clicked (outside button)', async () => {
    const wrapper = mountWrapper()

    const disclaimer = wrapper.find('.home-bulk-send__mmlite-disclaimer')
    await disclaimer.trigger('click')

    expect(wrapper.find('.activate-mmlite-modal').exists()).toBe(false)
  })

  it('should open the modal when the show more button inside the disclaimer is clicked', async () => {
    const wrapper = mountWrapper()

    const button = wrapper.find('.show-more-button')
    await button.trigger('click')

    expect(wrapper.find('.activate-mmlite-modal').exists()).toBe(true)
  })
})
