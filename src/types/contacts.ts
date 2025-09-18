import type { SelectOption } from '@/types/select';

export enum ContactFieldType {
  TEXT = 'T',
  NUMBER = 'N',
  DATE = 'D',
  STATE = 'S',
  DISTRICT = 'I',
  WARD = 'W',
}

export interface ContactField {
  key: string;
  label: string;
  valueType: ContactFieldType;
}

export interface ContactFieldWithExample extends ContactField {
  example: string;
}

export type ContactFieldOption = SelectOption<string>;
