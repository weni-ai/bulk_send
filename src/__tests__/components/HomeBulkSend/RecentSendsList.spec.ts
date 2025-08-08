import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import RecentSendsList from '@/components/HomeBulkSend/RecentSendsList.vue'
import type { RecentSend } from '@/types/recentSends'

const PAGE_SIZE = 5

const buildRecentSends = (count: number): RecentSend[] => {
  return Array.from({ length: count }, (_, i) => i + 1).map((id) => ({
    id,
    name: `Send ${id}`,
    status: id % 2 === 0 ? 'finished' : 'running',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    endedAt: new Date('2024-01-01T01:00:00.000Z'),
    template: { name: 'Template' },
    groups: ['G1'],
    createdBy: 'User',
    metrics: { sent: 10, delivered: 5, read: 4, clicked: 1, failed: 1, estimatedCost: '0.00' },
  }))
}

const stubs = {
  SendElement: {
    props: ['send'],
    template: '<div class="send-element-stub">Send {{ send.id }}</div>',
  },
  UnnnicPagination: {
    props: ['max', 'modelValue'],
    emits: ['update:model-value'],
    template:
      '<div class="unnnic-pagination-stub" :data-max="max" :data-page="modelValue" @click="$emit(\'update:model-value\', (modelValue || 1) + 1)">Pagination</div>',
  },
}

const mountWrapper = (recentSends: RecentSend[]): VueWrapper => {
  return mount(RecentSendsList, {
    props: { recentSends },
    global: { stubs },
  })
}

describe('RecentSendsList.vue', () => {
  it('renders first page with up to PAGE_SIZE sends', () => {
    const wrapper = mountWrapper(buildRecentSends(12))
    const items = wrapper.findAll('.send-element-stub')
    expect(items).toHaveLength(PAGE_SIZE)
    expect(wrapper.text()).toContain('Send 1')
    expect(wrapper.text()).not.toContain('Send 6')
  })

  it('sets pagination max pages based on list length', () => {
    const wrapper = mountWrapper(buildRecentSends(12))
    const maxAttr = wrapper.find('.unnnic-pagination-stub').attributes('data-max')
    expect(Number(maxAttr)).toBe(3)
  })

  it('changes page and updates rendered sends', async () => {
    const wrapper = mountWrapper(buildRecentSends(12))
    const pagination = wrapper.find('.unnnic-pagination-stub')

    // Go to page 2
    await pagination.trigger('click')
    expect(wrapper.text()).toContain('Send 6')
    expect(wrapper.text()).toContain('Send 10')
    expect(wrapper.text()).not.toContain('Send 11')

    // Go to page 3
    await pagination.trigger('click')
    const items = wrapper.findAll('.send-element-stub')
    expect(items).toHaveLength(2)
    expect(wrapper.text()).toContain('Send 11')
    expect(wrapper.text()).toContain('Send 12')
  })
})
