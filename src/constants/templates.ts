const PAGE_SIZE = 5;

enum TemplateStatus {
  APPROVED = 'A',
  IN_APPEAL = 'I',
  PENDING = 'P',
  REJECTED = 'R',
  PENDING_DELETION = 'E',
  DELETED = 'D',
  DISABLED = 'S',
  LOCKED = 'L',
  UNSUPPORTED_LANGUAGE = 'U',
  PAUSED = 'T',
}

export { PAGE_SIZE, TemplateStatus };
