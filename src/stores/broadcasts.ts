import { defineStore } from 'pinia';
import type {
  BroadcastStatistic,
  BroadcastStatisticsParams,
  BroadcastsMonthPerformance,
} from '@/types/broadcast';

import BroadcastStatistics from '@/api/resources/broadcasts';
import { ContactGroupStatus } from '@/constants/broadcasts';

export const useBroadcastsStore = defineStore('broadcasts', {
  state: () => ({
    loadingBroadcastsStatistics: false,
    loadingBroadcastsMonthPerformance: false,
    loadingCreateGroupFromStatus: false,
    broadcastsStatisticsCount: 0,
    broadcastsStatistics: <BroadcastStatistic[]>[],
    broadcastMonthPerformance: <BroadcastsMonthPerformance>{
      totalSent: 0,
      estimatedCost: 0,
      successRate: 0,
    },
  }),
  actions: {
    async getBroadcastsStatistics(
      projectUuid: string,
      params: BroadcastStatisticsParams,
    ) {
      this.loadingBroadcastsStatistics = true;
      try {
        const response = await BroadcastStatistics.getBroadcastsStatistics(
          projectUuid,
          params,
        );
        this.broadcastsStatisticsCount = response.data.count;
        this.broadcastsStatistics = response.data.results.map(
          (result: BroadcastStatistic) => ({
            ...result,
            createdOn: new Date(result.createdOn),
            modifiedOn: new Date(result.modifiedOn),
          }),
        );
      } finally {
        this.loadingBroadcastsStatistics = false;
      }
    },
    async getBroadcastsMonthPerformance(projectUuid: string) {
      this.loadingBroadcastsMonthPerformance = true;
      try {
        const response =
          await BroadcastStatistics.getBroadcastsMonthPerformance(projectUuid);

        const stats = response.data.last30DaysStats;
        const cost = 123; // TODO: calculate cost from the response when API brings the required fields

        this.broadcastMonthPerformance = {
          totalSent: stats.totalSent,
          estimatedCost: cost,
          successRate: response.data.successRate,
        };
      } finally {
        this.loadingBroadcastsMonthPerformance = false;
      }
    },
    async createGroupFromStatus(
      projectUuid: string,
      groupName: string,
      broadcastID: number,
      status: keyof typeof ContactGroupStatus,
    ) {
      this.loadingCreateGroupFromStatus = true;
      try {
        const response = await BroadcastStatistics.createGroupFromStatus(
          projectUuid,
          groupName,
          broadcastID,
          status,
        );

        return response.data;
      } finally {
        this.loadingCreateGroupFromStatus = false;
      }
    },
  },
});
