import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    project: {
      uuid: '',
    },
  }),
  actions: {
    setProjectUuid(projectUuid: string) {
      this.project.uuid = projectUuid
    },
  },
})
