import request from '@/api/requests';
import type { PageRequestParams } from '@/types/requests';

export default {
  async getGroups(projectUuid: string, params: PageRequestParams) {
    const response = await request.$http.get(
      `/api/v2/internals/contact_groups`,
      {
        params: {
          ...params,
          project_uuid: projectUuid,
        },
      },
    );
    return response;
  },
};
