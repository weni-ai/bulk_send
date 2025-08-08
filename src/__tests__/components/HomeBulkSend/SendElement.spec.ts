import { describe, it, expect, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import SendElement from '@/components/HomeBulkSend/SendElement.vue'
import type { RecentSend } from '@/types/recentSends'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const stubs = {
  UnnnicCollapse: {
    template: '<div class="unnnic-collapse-stub"><slot name="header" /><slot /></div>',
  },
  UnnnicTag: {
    props: ['text'],
    template: '<div class="unnnic-tag-stub" :class="$attrs.class">{{ text }}</div>',
  },
  MetricsTable: {
    name: 'MetricsTable',
    props: ['data', 'maxColumns'],
    template: '<div class="metrics-table-stub">Metrics: {{ data?.length }}</div>',
  },
  SendElementInfo: {
    template: '<div class="send-element-info-stub" />',
  },
}

const mountWrapper = (send: Partial<RecentSend> = {}): VueWrapper => {
  const mockSend: RecentSend = {
    id: 1,
    name: 'Test Send',
    status: 'finished',
    createdAt: new Date('2024-01-01T12:00:00.000Z'),
    endedAt: new Date('2024-01-01T13:00:00.000Z'),
    template: { name: 'Template A' },
    groups: ['Group 1', 'Group 2'],
    createdBy: 'Alice',
    metrics: {
      sent: 10,
      delivered: 9,
      read: 8,
      clicked: 2,
      failed: 1,
      estimatedCost: '1.23',
    },
    ...send,
  }

  return mount(SendElement, {
    props: { send: mockSend },
    global: {
      stubs,
    },
  })
}

describe('SendElement.vue', () => {
  it('renders header with title, date and tag text', () => {
    const wrapper = mountWrapper()

    expect(wrapper.find('.send-element__title').text()).toBe('Test Send')
    expect(wrapper.find('.send-element__date').text()).toBe('01/01/2024')
    expect(wrapper.find('.unnnic-tag-stub').text()).toBe('finished')
  })

  it('applies green tag scheme when status is finished', () => {
    const wrapper = mountWrapper({ status: 'finished' })
    expect(wrapper.find('.send-element__tag--aux-green').exists()).toBe(true)
  })

  it('applies orange tag scheme when status is not finished', () => {
    const wrapper = mountWrapper({ status: 'running' })
    expect(wrapper.find('.send-element__tag--aux-orange').exists()).toBe(true)
  })

  it('passes key metric values to MetricsTable', () => {
    const wrapper = mountWrapper()
    const metricsComp = wrapper.findComponent({ name: 'MetricsTable' })
    const data = metricsComp.props('data') as Array<any>

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(6)

    // Sent
    expect(data[0].value).toBe('10')

    // Delivered percentage and subValue
    expect(data[1].value).toBe('90%')
    expect(data[1].subValue).toBe('9')

    // Failed percentage
    expect(data[5].value).toBe('10%')
    expect(data[5].subValue).toBe('1')
  })
})
