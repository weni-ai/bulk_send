<template>
  <BulkSendHomeLayout>
    <template #header>
      <HomeHeader />
    </template>
    <template #content>
      <MetricsTable :data="generalPerformanceData" :maxColumns="3" />
    </template>
  </BulkSendHomeLayout>
</template>

<script setup lang="ts">
import BulkSendHomeLayout from '@/layouts/BulkSend/BulkSendHomeLayout.vue'
import HomeHeader from '@/components/HomeBulkSend/HomeHeader.vue'
import MetricsTable from '@/components/MetricsTable.vue'

const generalPerformanceData = [
  {
    label: 'Total sent',
    value: '124.580',
    hint: 'Total number of messages sent through bulk sends within the selected period.',
    actions: [
      {
        label: 'View details',
        icon: 'info',
        onClick: () => {
          console.log('View details')
        },
      },
    ],
  },
  {
    label: 'Estimated total cost',
    value: '$ 7.474,80',
    hint: 'Estimated cost based on the number of messages sent. Final pricing may vary according to Meta’s billing.',
  },
  {
    label: 'Success rate',
    value: '91%',
    hint: 'Percentage of contacts who successfully received messages, calculated from the total number of unique contacts targeted across all sends.',
  },
  {
    label: 'Total sent 2',
    value: '124.580',
    hint: 'Total number of messages sent through bulk sends within the selected period.',
  },
  {
    label: 'Estimated total cost 2',
    value: '$ 7.474,80',
    hint: 'Estimated cost based on the number of messages sent. Final pricing may vary according to Meta’s billing.',
  },
  {
    label: 'Success rate 2',
    value: '91%',
    hint: 'Percentage of contacts who successfully received messages, calculated from the total number of unique contacts targeted across all sends.',
  },
]
</script>
