interface Channel {
  uuid: string;
  name: string;
  channelType: string;
  appUuid: string;
  mmLite?: boolean;
  waba?: string;
  phoneNumber?: string;
}

export type { Channel };
