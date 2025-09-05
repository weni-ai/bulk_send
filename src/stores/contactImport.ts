import {
  ContactImportGroupMode,
  type ContactImportColumnsData,
  type ContactImportProcessing,
  type ContactImportState,
} from '@/types/contactImport';
import { defineStore } from 'pinia';
import ContactImportAPI from '@/api/resources/contactImport';
import { AxiosError } from 'axios';
import type { Group } from '@/types/groups';
import { parseUploadError } from '@/utils/uploadError';

export const useContactImportStore = defineStore('contactImport', {
  state: () =>
    ({
      import: undefined,
      loadingContactImport: false,
      loadingConfirmContactImport: false,
      importProcessing: {
        groupMode: ContactImportGroupMode.NEW,
        addToGroup: true,
        groupName: '',
        group: undefined,
        columnsData: {},
      },
    }) as ContactImportState,
  actions: {
    async uploadContactImport(file: File) {
      this.loadingContactImport = true;
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await ContactImportAPI.uploadContactImport(formData);
        if (!response.data) {
          throw new Error('Error while uploading contact import');
        }

        this.import = response.data;
        this.import!.file = file;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw parseUploadError(error);
        }
        throw error;
      } finally {
        this.loadingContactImport = false;
      }
    },
    setProcessingGroupMode(groupMode: ContactImportGroupMode) {
      this.importProcessing.groupMode = groupMode;
    },
    setProcessingGroupName(groupName: string) {
      this.importProcessing.groupName = groupName;
    },
    setProcessingGroup(group?: Group) {
      this.importProcessing.group = group;
    },
    setProcessingAddToGroup(addToGroup: boolean) {
      this.importProcessing.addToGroup = addToGroup;
    },
    setProcessingColumnsData(columnsData: ContactImportColumnsData) {
      this.importProcessing.columnsData = columnsData;
    },
    async confirmContactImport(
      projectUuid: string,
      importId: number,
      importData: ContactImportProcessing,
    ) {
      this.loadingConfirmContactImport = true;
      try {
        const response = await ContactImportAPI.confirmContactImport(
          projectUuid,
          importId,
          importData,
        );
        console.log('Confirm Contact Import Response', response);
      } catch (error) {
        console.error(error); // TODO: Handle error
      } finally {
        this.loadingConfirmContactImport = false;
      }
    },
    clearImport() {
      this.import = undefined;
      this.importProcessing = {
        groupMode: ContactImportGroupMode.NEW,
        addToGroup: true,
        groupName: '',
        group: undefined,
        columnsData: {},
      };
    },
  },
});
