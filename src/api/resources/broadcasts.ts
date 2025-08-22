import request from '@/api/requests';
import { ContactGroupStatus } from '@/constants/broadcasts';
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
  async createGroupFromStatus(
    projectUuid: string,
    groupName: string,
    broadcastID: number,
    status: keyof typeof ContactGroupStatus,
  ) {
    const response = await request.$http.post(
      `/api/v2/internals/contact_groups?project_uuid=${projectUuid}`,
      {
        broadcast_id: broadcastID,
        name: groupName,
        status: ContactGroupStatus[status],
      },
    );

    return response;
  },
};
