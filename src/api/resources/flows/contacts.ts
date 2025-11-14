import request from '@/api/resources/flows/requests';
import { useProjectStore } from '@/stores/project';
import type { Group } from '@/types/groups';

export default {
  async getContactFields() {
    const { project } = useProjectStore();

    const params = {
      project: project.uuid,
    };

    const response = await request.$http.get(
      '/api/v2/internals/contacts_fields',
      { params },
    );
    return response;
  },
  async getContactFieldsExamplesByGroups(groups: Group[]) {
    const { project } = useProjectStore();

    const params = {
      project_uuid: project.uuid,
      group_ids: groups.map((group) => group.id).join(','),
    };

    const response = await request.$http.get(
      '/api/v2/internals/groups_contact_fields',
      { params },
    );
    return response;
  },
};
