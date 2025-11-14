import request from '@/api/resources/integrations/requests';
import { useProjectStore } from '@/stores/project';

export default {
  async listApps() {
    const { project } = useProjectStore();

    const params = {
      configured: true,
      project_uuid: project.uuid,
    };

    const response = await request.$http.get('/api/v1/my-apps/', { params });

    return response;
  },
};
