import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import SendElementInfo from '@/components/HomeBulkSend/SendElementInfo.vue'
import type { RecentSend } from '@/types/recentSends'

const mountWrapper = (props: { send: RecentSend }): VueWrapper => {
  return mount(SendElementInfo, {
    props,
    global: {
      mocks: {
        $t: () => 'stubbed text',
      },
    },
  })
}

const mockSend: RecentSend = {
  id: 1,
  name: 'Test Send',
  status: 'completed',
  createdAt: new Date('2024-01-01T09:00:00.000Z'),
  endedAt: new Date('2024-01-01T10:00:00.000Z'),
  template: { name: 'Template A' },
  groups: ['Group 1', 'Group 2'],
  createdBy: 'Alice',
  metrics: {
    sent: 10,
    delivered: 9,
    read: 8,
    clicked: 2,
    failed: 1,
    estimatedCost: '$1.23',
  },
}

describe('SendElementInfo.vue', () => {
  it('renders basic info (dates, template, groups, creator)', () => {
    const wrapper = mountWrapper({ send: mockSend })

    expect(wrapper.find('.send-element-info').exists()).toBe(true)
    expect(wrapper.text()).toContain('Jan 1, 9:00 AM')
    expect(wrapper.text()).toContain('Jan 1, 10:00 AM')
    expect(wrapper.text()).toContain('Template A')
    expect(wrapper.text()).toContain('Group 1, Group 2')
    expect(wrapper.text()).toContain('Alice')
  })
})
