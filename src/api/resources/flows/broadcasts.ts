import request from '@/api/resources/flows/requests';
import { ContactGroupStatus } from '@/constants/broadcasts';
import { useProjectStore } from '@/stores/project';
import type { PageRequestParams } from '@/types/requests';
import type { CreateBroadcastData } from '@/types/broadcast';
import type { Template } from '@/types/template';
import type { FlowReference } from '@/types/flow';
import type { Channel } from '@/types/channel';

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
  async createBroadcast(
    name: string,
    template: Template,
    variables: string[],
    groups: string[],
    channel: Channel,
    attachment?: { url: string; type: string },
    flow?: FlowReference,
  ) {
    const { project } = useProjectStore();

    const data: CreateBroadcastData = {
      queue: 'template_batch',
      project: project.uuid,
      name: name,
      groups: groups,
      channel: channel.uuid,
      msg: {
        template: {
          uuid: template.uuid,
          variables: variables,
          locale: template.language,
        },
      },
    };

    if (attachment) {
      data.msg.attachments = [`${attachment.type}:${attachment.url}`];
    }

    if (flow) {
      data.trigger_flow_uuid = flow.uuid;
    }

    const response = await request.$http.post(
      `/api/v2/internals/whatsapp_broadcasts`,
      data,
    );
    return response;
  },
  async uploadMedia(file: File) {
    const { project } = useProjectStore();
    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_uuid', project.uuid);

    const response = await request.$http.post(
      `/api/v2/internals/broadcasts/upload_media`,
      formData,
      { headers },
    );
    return response;
  },
};
