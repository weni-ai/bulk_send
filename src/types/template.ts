import type { PageRequestParams } from '@/types/requests';
import type { TemplateStatus } from '@/constants/templates';

interface TemplateReference {
  id: number;
  name: string;
}

interface TemplateUUIDReference {
  uuid: string;
  name: string;
}

interface Template extends TemplateUUIDReference {
  createdOn: string;
  category: string;
  language: string;
  header?: TemplateHeader;
  body: TemplateBody;
  footer?: TemplateFooter;
  buttons?: TemplateButton[];
  status: TemplateStatus;
}

type TemplateHeader =
  | TemplateHeaderText
  | TemplateHeaderImage
  | TemplateHeaderVideo
  | TemplateHeaderDocument;

interface TemplateHeaderText {
  type: 'TEXT';
  text: string;
}

interface TemplateHeaderImage {
  type: 'IMAGE';
}
interface TemplateHeaderVideo {
  type: 'VIDEO';
}

interface TemplateHeaderDocument {
  type: 'DOCUMENT';
}

interface TemplateBody {
  text: string;
}

interface TemplateFooter {
  text: string;
}

type TemplateButton =
  | TemplateButtonText
  | TemplateButtonURL
  | TemplateButtonPhoneNumber;

interface TemplateButtonText {
  type: 'TEXT';
  text: string;
}

interface TemplateButtonURL {
  type: 'URL';
  url: string;
}

interface TemplateButtonPhoneNumber {
  type: 'PHONE_NUMBER';
  country_code: string;
  phone_number: string;
}

interface TemplateRequestParams extends PageRequestParams {
  name?: string;
  language?: string;
  order_by?: string;
}

interface TemplatePreview {
  uuid: string;
  name: string;
  body: string;
  footer?: string;
  buttons?: TemplateButton[];
  header?: TemplatePreviewHeader;
}

type TemplatePreviewHeader =
  | TemplateHeaderText
  | {
      type: 'MEDIA';
      mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    };

export type {
  TemplateRequestParams,
  TemplateReference,
  Template,
  TemplateHeader,
  TemplateBody,
  TemplateFooter,
  TemplateButton,
  TemplatePreview,
  TemplatePreviewHeader,
};
