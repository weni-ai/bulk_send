import { defineStore } from 'pinia';
import type {
  BroadcastStatistic,
  BroadcastsMonthPerformance,
} from '@/types/broadcast';
import type { RequestParams } from '@/types/requests';
import BroadcastStatistics from '@/api/resources/broadcasts';

export const useBroadcastsStore = defineStore('broadcasts', {
  state: () => ({
    loadingBroadcastsStatistics: false,
    loadingBroadcastsMonthPerformance: false,
    broadcastsStatisticsCount: 0,
    broadcastsStatistics: <BroadcastStatistic[]>[],
    broadcastMonthPerformance: <BroadcastsMonthPerformance>{
      totalSent: 0,
      estimatedCost: 0,
      successRate: 0,
    },
  }),
  actions: {
    async getBroadcastsStatistics(projectUuid: string, params: RequestParams) {
      this.loadingBroadcastsStatistics = true;
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
      this.loadingBroadcastsStatistics = false;
    },
    async getBroadcastsMonthPerformance(projectUuid: string) {
      this.loadingBroadcastsMonthPerformance = true;
      const response =
        await BroadcastStatistics.getBroadcastsMonthPerformance(projectUuid);

      const stats = response.data.last30DaysStats;
      const cost = 123; // TODO: calculate cost from the response when API brings the required fields

      this.broadcastMonthPerformance = {
        totalSent: stats.totalSent,
        estimatedCost: cost,
        successRate: response.data.successRate,
      };
      this.loadingBroadcastsMonthPerformance = false;
    },
  },
});
