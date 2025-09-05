import request from '@/api/requests';
import { useProjectStore } from '@/stores/project';
import type { TemplateRequestParams } from '@/types/template';

const { project } = useProjectStore();

export default {
  async getTemplates(queryParams: TemplateRequestParams) {
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
};
