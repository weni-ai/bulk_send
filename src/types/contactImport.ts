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

export interface ContactImportColumn {
  header: string;
  type: ContactImportColumnType;
  matchedField?: string;
  suggestedType?: ContactFieldType;
}

export interface ContactImportState {
  loadingContactImport: boolean;
  loadingConfirmContactImport: boolean;
  import?: ContactImport;
  importProcessing: ContactImportProcessing;
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
