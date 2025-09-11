import { defineStore } from 'pinia';
import type {
  BroadcastStatistic,
  BroadcastStatisticsParams,
  BroadcastsMonthPerformance,
  NewBroadcastState,
} from '@/types/broadcast';

import BroadcastStatisticsAPI from '@/api/resources/broadcasts';
import { ContactGroupStatus, NewBroadcastPage } from '@/constants/broadcasts';
import type { Group } from '@/types/groups';
import type { Template } from '@/types/template';

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
    newBroadcast: <NewBroadcastState>{
      currentPage: NewBroadcastPage.SELECT_GROUPS,
      groupSelectionOpen: true,
      contactImportOpen: false,
      selectedGroups: [],
      selectedTemplate: undefined,
    },
  }),
  actions: {
    async getBroadcastsStatistics(
      projectUuid: string,
      params: BroadcastStatisticsParams,
    ) {
      this.loadingBroadcastsStatistics = true;
      try {
        const response = await BroadcastStatisticsAPI.getBroadcastsStatistics(
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
          await BroadcastStatisticsAPI.getBroadcastsMonthPerformance(
            projectUuid,
          );

        const stats = response.data.last30DaysStats;
        const cost = 123; // TODO: calculate cost from the response when API brings the required fields

        this.broadcastMonthPerformance = {
          totalSent: stats.totalSent,
          estimatedCost: cost,
          successRate: response.data.successRate30Days,
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
        const response = await BroadcastStatisticsAPI.createGroupFromStatus(
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
    setNewBroadcastPage(page: NewBroadcastPage) {
      this.newBroadcast.currentPage = page;
    },
    setSelectedGroups(groups: Group[]) {
      this.newBroadcast.selectedGroups = groups;
    },
    setGroupSelectionOpen(value: boolean) {
      this.newBroadcast.groupSelectionOpen = value;
    },
    setContactImportOpen(value: boolean) {
      this.newBroadcast.contactImportOpen = value;
    },
    setSelectedTemplate(template?: Template) {
      this.newBroadcast.selectedTemplate = template;
    },
  },
});
