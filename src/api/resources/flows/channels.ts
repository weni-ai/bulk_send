import request from '@/api/resources/flows/requests';
import { useProjectStore } from '@/stores/project';

// TODO: refactor to get project as a parameter instead of using the store, keeping the api resources with minimal dependencies
export default {
  async listChannels() {
    const { project } = useProjectStore();

    const params = {
      project_uuid: project.uuid,
    };

    const response = await request.$http.get(
      `/api/v2/internals/channels-by-project`,
      { params },
    );

    return response;
  },
};
