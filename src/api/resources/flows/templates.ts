import request from '@/api/resources/flows/requests';
import { useProjectStore } from '@/stores/project';
import type { TemplateRequestParams } from '@/types/template';

export default {
  async getTemplates(queryParams: TemplateRequestParams) {
    const { project } = useProjectStore();
    const params = {
      project_uuid: project.uuid,
      ...queryParams,
    };

    const response = await request.$http.get('/api/v2/templates/translations', {
      params,
    });
    return response;
  },
  async getTemplate(templateId: number) {
    const { project } = useProjectStore();
    const params = {
      project_uuid: project.uuid,
    };

    return await request.$http.get(
      `/api/v2/templates/translations/${templateId}`,
      {
        params,
      },
    );
  },
  async getTemplatePricing() {
    const { project } = useProjectStore();
    const params = {
      project_uuid: project.uuid,
    };

    const response = await request.$http.get('/api/v2/billing_pricing', {
      params,
    });
    return response;
  },
};
