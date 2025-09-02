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
  type: ContactFieldType;
}
