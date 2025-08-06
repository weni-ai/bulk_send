import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import HomeBulkSend from '@/views/BulkSend/HomeBulkSend.vue'

// Mock i18n
const $t = vi.fn((key) => key)

describe('HomeBulkSend.vue', () => {
  it('should call handleMMLiteDisclaimerClick when disclaimer is clicked', async () => {
    const wrapper = mount(HomeBulkSend, {
      global: {
        mocks: {
          $t,
        },
        stubs: {
          BulkSendHomeLayout: {
            template: '<div><slot name="header" /><slot name="content" /></div>',
          },
          HomeHeader: true,
          MetricsTable: true,
          BasicDivider: true,
          UnnnicDisclaimer: {
            template: '<div class="home-bulk-send__mmlite-disclaimer" @click="$emit(\'click\')"></div>',
            emits: ['click'],
          },
          UnnnicButton: {
            template: '<button class="unnnic-button-stub" @click="$emit(\'click\')"></button>',
            emits: ['click'],
          },
          UnnnicInputDatePicker: {
            template: '<input class="unnnic-input-date-picker-stub" @change="$emit(\'update:modelValue\', { start: \'2024-01-01\', end: \'2024-01-31\' })" />',
            emits: ['update:modelValue'],
          },
          UnnnicInput: {
            template: '<input class="unnnic-input-stub" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          },
        },
      },
    })

    // TODO: spy on console.log for now since we don't have a real implementation yet
    const consoleSpy = vi.spyOn(console, 'log')

    const disclaimer = wrapper.find('.home-bulk-send__mmlite-disclaimer')
    await disclaimer.trigger('click')

    expect(consoleSpy).toHaveBeenCalledWith('handleMMLiteDisclaimerClick')

    consoleSpy.mockRestore()
  })
})
