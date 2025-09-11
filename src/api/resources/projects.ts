import request from '@/api/requests';
import { useProjectStore } from '@/stores/project';

export default {
  async getProjectInfo() {
    const { project } = useProjectStore();

    const params = {
      project_uuid: project.uuid,
    };

    const response = await request.$http.get('/api/v2/projects', { params });
    return response;
  },
};
