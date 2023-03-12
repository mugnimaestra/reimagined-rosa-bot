import { Client, TextMessage, MessageEvent, WebhookEvent } from '@line/bot-sdk';
import dotenv from 'dotenv';
import { Mention, MentionTextMessage } from './types.js';

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

const mainFunction = (event: MessageEvent): void => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text messages
    return;
  }
  let message;
  if (event.message.text.startsWith('!pilih')) {
    // Split the input string by the "atau" keyword
    const options = event.message.text.substring(7).split('atau');

    // Trim whitespace from both options
    const optionA = options[0].trim();
    const optionB = options[1].trim();

    // Randomly pick an option with a 50% chance for each option
    const randomNum = Math.random();
    if (randomNum < 0.5) {
      message = optionA;
    } else {
      message = optionB;
    }
  }

  if (message) {
    client.replyMessage(event.replyToken, createTextMessage(message));
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
