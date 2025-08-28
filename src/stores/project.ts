import { defineStore } from 'pinia';
import ChannelsAPI from '@/api/resources/channels';
import type { Channel } from '@/types/channel';

export const useProjectStore = defineStore('project', {
  state: () => ({
    loadingChannels: false,
    project: {
      uuid: '',
      channels: <Channel[]>[],
    },
  }),
  actions: {
    setProjectUuid(projectUuid: string) {
      this.project.uuid = projectUuid;
    },
    async getProjectChannels() {
      this.loadingChannels = true;
      const response = await ChannelsAPI.listChannels();
      this.project.channels = response.data.results;
      this.loadingChannels = false;
    },
  },
});
