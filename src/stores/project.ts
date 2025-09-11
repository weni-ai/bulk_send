import { defineStore } from 'pinia';
import ChannelsAPI from '@/api/resources/channels';
import ProjectsAPI from '@/api/resources/projects';
import type { Channel } from '@/types/channel';
import type { Project } from '@/types/project';

export const useProjectStore = defineStore('project', {
  state: () => ({
    loadingChannels: false,
    loadingProjectInfo: false,
    project: <Project>{
      uuid: '',
      brainOn: false,
      channels: <Channel[]>[],
    },
  }),
  actions: {
    setProjectUuid(projectUuid: string) {
      this.project.uuid = projectUuid;
    },
    async getProjectChannels() {
      this.loadingChannels = true;
      try {
        const response = await ChannelsAPI.listChannels();
        this.project.channels = response.data.results;
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingChannels = false;
      }
    },
    async getProjectInfo() {
      this.loadingProjectInfo = true;
      try {
        const response = await ProjectsAPI.getProjectInfo();
        this.project.brainOn = response.data.brain_on;
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingProjectInfo = false;
      }
    },
  },
});
