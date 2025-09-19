import { defineStore } from 'pinia';
import GroupsAPI from '@/api/resources/groups';
import type { Group } from '@/types/groups';
import type { PageRequestParams } from '@/types/requests';

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    loadingGroups: false,
    groups: <Group[]>[],
    groupsCount: 0,
  }),
  actions: {
    async getGroups(projectUuid: string, params: PageRequestParams) {
      this.loadingGroups = true;
      const response = await GroupsAPI.getGroups(projectUuid, params);
      this.groups = response.data.results;
      this.groupsCount = response.data.count;
      this.loadingGroups = false;
    },
    async listAllGroups(projectUuid: string) {
      this.loadingGroups = true;
      let page = 1;
      while (true) {
        const response = await GroupsAPI.getGroups(projectUuid, {
          offset: (page - 1) * 100,
          limit: 100,
        });
        this.groups = [...this.groups, ...response.data.results];
        if (response.data.next === null) {
          break;
        }
        page += 1;
      }
      this.loadingGroups = false;
    },
  },
});
