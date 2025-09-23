import { defineStore } from 'pinia';
import type {
  BroadcastStatistic,
  BroadcastStatisticsParams,
  BroadcastsMonthPerformance,
  NewBroadcastState,
} from '@/types/broadcast';

import BroadcastsAPI from '@/api/resources/broadcasts';
import { ContactGroupStatus, NewBroadcastPage } from '@/constants/broadcasts';
import type { Group } from '@/types/groups';
import type { Template } from '@/types/template';
import type { ContactField } from '@/types/contacts';
import type { FlowReference } from '@/types/flow';
import { useTemplatesStore } from '@/stores/templates';
import { Currency } from '@/constants/currency';
import { toLocalizedFloat } from '@/utils/number';

export const useBroadcastsStore = defineStore('broadcasts', {
  state: () => ({
    loadingBroadcastsStatistics: false,
    loadingBroadcastsMonthPerformance: false,
    loadingCreateGroupFromStatus: false,
    loadingCreateBroadcast: false,
    loadingUploadMedia: false,
    broadcastsStatisticsCount: 0,
    broadcastsStatistics: <BroadcastStatistic[]>[],
    broadcastMonthPerformance: <BroadcastsMonthPerformance>{
      totalSent: 0,
      estimatedCost: '-',
      successRate: 0,
    },
    newBroadcast: <NewBroadcastState>{
      currentPage: NewBroadcastPage.SELECT_GROUPS,
      groupSelectionOpen: true,
      contactImportOpen: false,
      selectedGroups: [],
      selectedTemplate: undefined,
      variableMapping: {},
      broadcastName: '',
      headerMediaFileUrl: undefined,
      headerMediaFile: undefined,
      headerMediaFileType: undefined,
      selectedFlow: undefined,
      reviewed: false,
    },
  }),
  actions: {
    async getBroadcastsStatistics(
      projectUuid: string,
      params: BroadcastStatisticsParams,
    ) {
      this.loadingBroadcastsStatistics = true;
      try {
        const response = await BroadcastsAPI.getBroadcastsStatistics(
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

      const templateStore = useTemplatesStore();
      await templateStore.getTemplatePricing();

      try {
        const response =
          await BroadcastsAPI.getBroadcastsMonthPerformance(projectUuid);

        const stats = response.data.last30DaysStats;
        const cost =
          templateStore.templatePricing.rates.marketing * stats.totalSent;
        const currency = Currency[templateStore.templatePricing.currency];

        this.broadcastMonthPerformance = {
          totalSent: stats.totalSent,
          estimatedCost: `${currency}${toLocalizedFloat(cost)}`,
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
        const response = await BroadcastsAPI.createGroupFromStatus(
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
    async createBroadcast(
      name: string,
      template: Template,
      variables: string[],
      groups: string[],
      attachment?: { url: string; type: string },
      flow?: FlowReference,
    ) {
      this.loadingCreateBroadcast = true;
      try {
        const response = await BroadcastsAPI.createBroadcast(
          name,
          template,
          variables,
          groups,
          attachment,
          flow,
        );
        return response.data;
      } finally {
        this.loadingCreateBroadcast = false;
      }
    },
    async uploadMedia(file: File) {
      this.loadingUploadMedia = true;
      try {
        const response = await BroadcastsAPI.uploadMedia(file);
        this.newBroadcast.headerMediaFileUrl = response.data.url;
        this.newBroadcast.headerMediaFileType = response.data.type;
      } finally {
        this.loadingUploadMedia = false;
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
    clearVariableMapping() {
      this.newBroadcast.variableMapping = {};
    },
    updateVariableMapping(index: number, value: ContactField | undefined) {
      this.newBroadcast.variableMapping[index] = value;
    },
    setBroadcastName(name: string) {
      this.newBroadcast.broadcastName = name;
    },
    setSelectedFlow(flow?: FlowReference) {
      this.newBroadcast.selectedFlow = flow;
    },
    setReviewed(value: boolean) {
      this.newBroadcast.reviewed = value;
    },
    setHeaderMediaFileUrl(url?: string) {
      this.newBroadcast.headerMediaFileUrl = url;
    },
    setHeaderMediaFile(file?: File) {
      this.newBroadcast.headerMediaFile = file;
    },
    resetNewBroadcast() {
      this.newBroadcast = {
        currentPage: NewBroadcastPage.SELECT_GROUPS,
        groupSelectionOpen: true,
        contactImportOpen: false,
        selectedGroups: [],
        selectedTemplate: undefined,
        variableMapping: {},
        broadcastName: '',
        selectedFlow: undefined,
        headerMediaFileUrl: undefined,
        reviewed: false,
      };
    },
  },
});
