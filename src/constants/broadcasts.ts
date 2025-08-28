import type { CoreStatistics } from '@/types/broadcast';

enum BroadcastStatus {
  QUEUED = 'Q',
  SENT = 'S',
  FAILED = 'F',
}

const ContactGroupStatus: Record<keyof CoreStatistics, string> = {
  processed: 'P',
  sent: 'S',
  delivered: 'D',
  read: 'R',
  failed: 'F',
};

enum NewBroadcastPage {
  SELECT_GROUPS = 'select_groups',
  SELECT_TEMPLATE = 'select_template',
  SELECT_VARIABLES = 'select_variables',
  CONFIRM_AND_SEND = 'confirm_and_send',
}

export { BroadcastStatus, ContactGroupStatus, NewBroadcastPage };
