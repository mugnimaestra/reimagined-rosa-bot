import { Client, TextMessage, MessageEvent, WebhookEvent } from '@line/bot-sdk';
import dotenv from 'dotenv';
import { Mention, MentionTextMessage } from '../types.js';
import { reelUrlRegex } from './constant';
import { downloadReels, pickAnOption } from './functions';

if (!process.env.LINE_CHANNEL_SECRET) {
  dotenv.config();
}

export const client = new Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_ACCESS_TOKEN!,
});

// function for creating a reply message
export const createTextMessage = (
  message: string,
  mentions?: Mention[]
): MentionTextMessage => {
  return {
    type: 'text',
    text: message,
    mention: mentions
      ? {
          mentionees: mentions,
        }
      : undefined,
  };
};

const mainFunction = async (event: MessageEvent): Promise<void> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text messages
    return;
  }
  let message;

  // #1 make rosa pick between 2 options
  if (event.message.text.startsWith('!pilih')) {
    message = pickAnOption(event.message.text);
  }

  // #2 catch and send video message from messages reel
  if ((event.message.text.match(reelUrlRegex) ?? '')?.length > 0) {
    const reelUrl = event.message.text.match(reelUrlRegex)?.[0];
    if (typeof reelUrl === 'string') {
      const videoUrl = await downloadReels(reelUrl);
      message = videoUrl;
    }
  }

  if (message) {
    client
      .replyMessage(event.replyToken, createTextMessage(message))
      .catch(err => {
        console.log('what the heck kok error?', err);
      });
  }
};

// function for handling incoming text messages
export const handleTextMessage = (event: MessageEvent): void => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text messages
    return;
  }

  const userId = event.source.userId;

  if (process.env.NODE_ENV === 'development') {
    if (userId === 'Ua684ecb5c5d077e54d95a1d3ebaae15a') {
      mainFunction(event);
    }
  } else {
    mainFunction(event);
  }
};

// function for handling unsend events
export const handleUnsendEvent = async (event: WebhookEvent): Promise<void> => {
  console.log(`Unsend event received: ${JSON.stringify(event)}`);
  let target;
  let displayName;

  switch (event.source.type) {
    case 'user':
      target = event.source.userId;
      break;
    case 'group':
      target = event.source.groupId;
      break;
    case 'room':
      target = event.source.roomId;
      break;
    default:
      target = null;
  }

  if (target) {
    if (event.source.userId) {
      await client.getProfile(event.source.userId).then(res => {
        console.log('user profile info', res);
        displayName = res.displayName;
      });
    }

    client.pushMessage(
      target,
      createTextMessage(`Wah, ${displayName ?? 'anon'} unsent apa tuh`)
    );
  }
};
