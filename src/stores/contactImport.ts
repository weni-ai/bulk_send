import {
  ContactImportGroupMode,
  ContactImportStatus,
  type ContactImportColumnsData,
  type ContactImportProcessing,
  type ContactImportState,
} from '@/types/contactImport';
import { defineStore } from 'pinia';
import ContactImportAPI from '@/api/resources/contactImport';
import { AxiosError, type AxiosProgressEvent } from 'axios';
import type { Group } from '@/types/groups';
import { isCanceledUploadError, parseUploadError } from '@/utils/uploadError';

export const useContactImportStore = defineStore('contactImport', {
  state: () =>
    ({
      import: undefined,
      loadingContactImport: false,
      loadingConfirmContactImport: false,
      loadingGetImportInfo: false,
      abortController: undefined as AbortController | undefined,
      importProcessing: {
        groupMode: ContactImportGroupMode.NEW,
        addToGroup: true,
        groupName: '',
        group: undefined,
        columnsData: {},
      },
      contactImportInfo: {
        status: ContactImportStatus.NOT_VERIFIED,
        numCreated: 0,
        numUpdated: 0,
        numErrored: 0,
        errors: [],
        timeTaken: 0,
      },
      contactImportGroup: undefined,
    }) as ContactImportState,
  actions: {
    async uploadContactImport(
      file: File,
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    ) {
      this.loadingContactImport = true;
      try {
        const formData = new FormData();
        formData.append('file', file);
        // ensure previous controller aborted
        this.cancelUpload();
        this.abortController = new AbortController();

        const response = await ContactImportAPI.uploadContactImport(
          formData,
          onUploadProgress,
          this.abortController.signal,
        );
        if (!response.data) {
          throw new Error('Error while uploading contact import');
        }

        this.import = response.data;
        this.import!.file = file;
      } catch (error) {
        if (isCanceledUploadError(error)) {
          throw error as AxiosError;
        }
        if (error instanceof AxiosError) {
          throw parseUploadError(error);
        }
        throw error as Error;
      } finally {
        this.loadingContactImport = false;
        this.abortController = undefined;
      }
    },
    cancelUpload() {
      if (this.abortController && !this.abortController.signal.aborted) {
        this.abortController.abort();
      }
      this.abortController = undefined;
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
        await ContactImportAPI.confirmContactImport(
          projectUuid,
          importId,
          importData,
        );
      } catch (error) {
        console.error(error); // TODO: Handle error
      } finally {
        this.loadingConfirmContactImport = false;
      }
    },
    async getImportInfo(importId: number) {
      this.loadingGetImportInfo = true;
      try {
        const response = await ContactImportAPI.getContactImport(importId);
        this.contactImportInfo = response.data.info;
        this.contactImportGroup = response.data.group;
      } catch (error) {
        console.error(error); // TODO: Handle error
      } finally {
        this.loadingGetImportInfo = false;
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
