import type { ContactField, ContactFieldType } from '@/types/contacts';
import type { Group } from './groups';

export interface ContactImport {
  importId: number;
  numRecords: number;
  columns: ContactImportColumn[];
  fields: ContactField[];
  errors: string[];
  file: File;
  duplicatedContactsCount: number;
}

export enum ContactImportColumnType {
  URN = 'urn',
  ATTRIBUTE = 'attribute',
  NEW_FIELD = 'new_field',
}

export enum ContactImportGroupMode {
  NEW = 'N',
  EXISTING = 'E',
}

export enum ContactImportStatus {
  NOT_VERIFIED = 'N',
  PENDING = 'P',
  PROCESSING = 'O',
  COMPLETE = 'C',
  FAILED = 'F',
}

export interface ContactImportColumn {
  header: string;
  type: ContactImportColumnType;
  matchedField?: string;
  suggestedType?: ContactFieldType;
  example?: string;
}

export interface ContactImportState {
  loadingContactImport: boolean;
  loadingConfirmContactImport: boolean;
  import?: ContactImport;
  importProcessing: ContactImportProcessing;
  abortController?: AbortController;
  contactImportInfo: ContactImportInfo;
}
export interface ContactImportInfo {
  status: ContactImportStatus;
  numCreated: number;
  numUpdated: number;
  numErrored: number;
  errors: string[];
  timeTaken: number;
}

export interface ContactImportProcessing {
  groupMode: ContactImportGroupMode;
  groupName?: string;
  group?: Group;
  addToGroup: boolean;
  columnsData: ContactImportColumnsData;
}

export interface ContactImportColumnsData {
  [key: string]: string | number | boolean | undefined;
}
