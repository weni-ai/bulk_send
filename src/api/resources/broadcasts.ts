import request from '@/api/requests';
import type { PageRequestParams } from '@/types/requests';

export default {
  async getBroadcastsStatistics(
    projectUuid: string,
    params: PageRequestParams,
  ) {
    const response = await request.$http.get(
      `/api/v2/internals/broadcasts-statistics`,
      {
        params: { project_uuid: projectUuid, ...params },
      },
    );
    return response;
  },
  async getBroadcastsMonthPerformance(projectUuid: string) {
    const response = await request.$http.get(
      `/api/v2/internals/broadcasts-statistics-stats`,
      { params: { project_uuid: projectUuid } },
    );
    return response;
  },
};
