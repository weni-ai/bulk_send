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

export { BroadcastStatus, ContactGroupStatus };
