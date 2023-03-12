import { TextMessage } from '@line/bot-sdk';

export interface Mention {
  type: 'user' | 'all';
  userId?: string;
  length: number;
  index: number;
}

export interface MentionTextMessage extends TextMessage {
  mention?: {
    mentionees: Mention[];
  };
}
