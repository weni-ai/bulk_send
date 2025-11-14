import request from '@/api/resources/flows/requests';
import { useProjectStore } from '@/stores/project';

export default {
  async getFlows() {
    const { project } = useProjectStore();

    const params = {
      project_uuid: project.uuid,
    };

    const response = await request.$http.get('/api/v2/internal_flows', {
      params,
    });
    return response;
  },
  async listAllFlows() {
    const { project } = useProjectStore();

    const params = {
      project_uuid: project.uuid,
    };

    const results = [];
    let url = '/api/v2/internal_flows';

    while (url) {
      const response = await request.$http.get(url, { params });
      results.push(...response.data.results);
      url = response.data.next;
    }

    return results;
  },
};
