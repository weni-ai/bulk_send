import type {
  Template,
  TemplateHeader,
  TemplatePreview,
  TemplatePreviewHeader,
} from '@/types/template';

const formatTemplateHeaderToPreview = (
  header?: TemplateHeader,
): TemplatePreviewHeader | undefined => {
  if (!header) {
    return undefined;
  }

  if (header.type !== 'TEXT') {
    return {
      type: 'MEDIA',
      mediaType: header.type,
    };
  }

  return header;
};

const formatTemplateToPreview = (
  template: Template,
  bodyFormatter?: (body: string) => string,
): TemplatePreview => {
  return {
    ...template,
    body: bodyFormatter
      ? bodyFormatter(template.body.text)
      : template.body.text,
    footer: template.footer?.text,
    buttons: template.buttons,
    header: formatTemplateHeaderToPreview(template.header),
  };
};

export { formatTemplateHeaderToPreview, formatTemplateToPreview };
