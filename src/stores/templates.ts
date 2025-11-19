import { defineStore } from 'pinia';
import TemplatesAPI from '@/api/resources/flows/templates';
import type {
  Template,
  TemplatePricing,
  TemplateRequestParams,
} from '@/types/template';

export const useTemplatesStore = defineStore('templates', {
  state: () => ({
    loadingTemplates: false,
    loadingTemplatePricing: false,
    templates: <Template[]>[],
    templatesCount: 0,
    templatePricing: <TemplatePricing>{
      currency: 'USD',
      rates: {
        marketing: 0,
        utility: 0,
        authentication: 0,
        service: 0,
      },
    },
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
    async getTemplatePricing() {
      this.loadingTemplatePricing = true;
      try {
        const response = await TemplatesAPI.getTemplatePricing();
        const rates = response.data.rates;
        this.templatePricing = {
          currency: response.data.currency,
          rates: {
            marketing: Number(rates.marketing),
            utility: Number(rates.utility),
            authentication: Number(rates.authentication),
            service: Number(rates.service),
          },
        };
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingTemplatePricing = false;
      }
    },
  },
});
