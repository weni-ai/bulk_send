import request from '@/api/resources/flows/requests';
import { useProjectStore } from '@/stores/project';
import type { ContactImportProcessing } from '@/types/contactImport';
import type { AxiosProgressEvent } from 'axios';

export default {
  async uploadContactImport(
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    signal?: AbortSignal,
  ) {
    const { project } = useProjectStore();

    formData.append('project_uuid', project.uuid);

    const response = await request.$http.post(
      '/api/v2/internals/contacts_import_upload',
      formData,
      {
        onUploadProgress,
        signal,
      },
    );
    return response;
  },
  async confirmContactImport(
    projectUuid: string,
    importId: number,
    importData: ContactImportProcessing,
  ) {
    const data = {
      project_uuid: projectUuid,
      add_to_group: importData.addToGroup,
      group_mode: importData.groupMode,
      new_group_name: importData.groupName || null,
      existing_group: importData.group?.id || null,
      ...importData.columnsData,
    };

    const response = await request.$http.post(
      `/api/v2/internals/contacts_import_confirm/${importId}/`,
      data,
    );
    return response;
  },
  async getContactImport(importId: number) {
    const { project } = useProjectStore();

    const params = {
      project_uuid: project.uuid,
    };

    const response = await request.$http.get(
      `/api/v2/internals/contacts_import_confirm/${importId}/`,
      { params },
    );
    return response;
  },
};
