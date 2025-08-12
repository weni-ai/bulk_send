import { describe, it, expect, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import NewContactGroup from '@/components/modals/NewContactGroup.vue'

const stubs = {
  UnnnicModalDialog: {
    // Emits buttons to simulate primary/secondary actions and renders default slot
    props: [
      'modelValue',
      'title',
      'primaryButtonProps',
      'secondaryButtonProps',
      'size',
      'showActionsDivider',
      'showCloseIcon',
    ],
    template:
      '<div class="unnnic-modal-dialog-stub"><slot /><button class="modal-stub__primary" @click="$emit(\'primaryButtonClick\')">primary</button><button class="modal-stub__secondary" @click="$emit(\'secondaryButtonClick\')">secondary</button></div>',
  },
  UnnnicInput: {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template:
      '<input class="unnnic-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  UnnnicDisclaimer: {
    props: ['text', 'icon', 'scheme'],
    template: '<div class="unnnic-disclaimer-stub">{{ text }}</div>',
  },
}

const mountWrapper = (props = {}) => {
  return mount(NewContactGroup, {
    props: {
      modelValue: true,
      contactCount: '12',
      category: 'Clicked',
      broadcastName: 'Promo',
      ...props,
    },
    global: {
      stubs,
      mocks: {
        $t: () => 'stubbed text',
      },
    },
  }) as VueWrapper
}

describe('NewContactGroup.vue', () => {
  it('renders with initial group name from props', () => {
    const wrapper = mountWrapper()
    const input = wrapper.find('.unnnic-input-stub')
    expect((input.element as HTMLInputElement).value).toBe('Clicked - Promo')
    expect(wrapper.find('.unnnic-disclaimer-stub').exists()).toBe(true)
  })

  it('updates group name when input changes', async () => {
    const wrapper = mountWrapper()
    const input = wrapper.find('.unnnic-input-stub')
    await input.setValue('New Group Name')
    expect((input.element as HTMLInputElement).value).toBe('New Group Name')
  })

  it('emits close on secondary and logs on primary', async () => {
    const wrapper = mountWrapper()

    // TODO: change to spy on API call when API is ready
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await wrapper.find('.modal-stub__primary').trigger('click')
    expect(logSpy).toHaveBeenCalledWith('primary button clicked')

    await wrapper.find('.modal-stub__secondary').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])

    logSpy.mockRestore()
  })
})
