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
