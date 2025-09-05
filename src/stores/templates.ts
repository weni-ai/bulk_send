import { defineStore } from 'pinia';
import TemplatesAPI from '@/api/resources/templates';
import type { Template, TemplateRequestParams } from '@/types/template';

export const useTemplatesStore = defineStore('templates', {
  state: () => ({
    loadingTemplates: false,
    templates: <Template[]>[],
    templatesCount: 0,
  }),
  actions: {
    async fetchTemplates(params: TemplateRequestParams) {
      this.loadingTemplates = true;
      try {
        const response = await TemplatesAPI.getTemplates(params);
        this.templates = response.data.results;
        this.templatesCount = response.data.count;
      } finally {
        this.loadingTemplates = false;
      }
    },
    async getTemplate(templateId: number) {
      return await TemplatesAPI.getTemplate(templateId);
    },
  },
});
