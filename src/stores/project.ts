import { defineStore } from 'pinia';
import ChannelsAPI from '@/api/resources/flows/channels';
import AppsAPI from '@/api/resources/integrations/apps';
import ProjectsAPI from '@/api/resources/flows/projects';
import type { Channel } from '@/types/channel';
import type { Project } from '@/types/project';
import { WENI_DEMO_NUMBER } from '@/constants/channels';

export const useProjectStore = defineStore('project', {
  state: () => ({
    loadedChannels: false,
    loadingChannels: false,
    loadingProjectInfo: false,
    project: <Project>{
      uuid: '',
      brainOn: false,
      channels: <Channel[]>[],
    },
  }),
  getters: {
    wppChannels: (state) => {
      return state.project.channels.filter(
        (channel) =>
          channel.channelType === 'WAC' &&
          channel.phoneNumber !== WENI_DEMO_NUMBER,
      );
    },
  },
  actions: {
    setProjectUuid(projectUuid: string) {
      this.project.uuid = projectUuid;
    },
    async getProjectChannels() {
      this.loadingChannels = true;
      try {
        const [response, appsResponse] = await Promise.all([
          ChannelsAPI.listChannels(),
          AppsAPI.listApps(),
        ]);

        const channelsWithAppUuid = response.data.results.map(
          (channel: Channel) => {
            return {
              ...channel,
              appUuid: appsResponse.data.find(
                (app: { flowObjectUuid: string }) =>
                  app.flowObjectUuid === channel.uuid,
              )?.uuid,
            };
          },
        );

        this.project.channels = channelsWithAppUuid;
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingChannels = false;
        this.loadedChannels = true;
      }
    },
    async getProjectInfo() {
      this.loadingProjectInfo = true;
      try {
        const response = await ProjectsAPI.getProjectInfo();
        this.project.brainOn = response.data.brainOn;
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingProjectInfo = false;
      }
    },
  },
});

export type ProjectStore = ReturnType<typeof useProjectStore>;
