interface Channel {
  uuid: string;
  name: string;
  channel_type: string;
  MMLite?: boolean;
  waba?: string;
  phone_number?: string;
}

export type { Channel };
