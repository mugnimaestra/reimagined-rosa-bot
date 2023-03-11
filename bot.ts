import { Client, TextMessage, MessageEvent, WebhookEvent } from '@line/bot-sdk';
import dotenv from 'dotenv';

if (!process.env.LINE_CHANNEL_SECRET) {
  dotenv.config();
}

export const client = new Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_ACCESS_TOKEN!,
});

// function for creating a reply message
export const createTextMessage = (message: string): TextMessage => {
  return {
    type: 'text',
    text: message,
  };
};

// function for handling incoming text messages
export const handleTextMessage = (event: MessageEvent): void => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text messages
    return;
  }

  const userId = event.source.userId;
  const message = event.message.text;

  const replyMessage = createTextMessage(message);

  if (process.env.NODE_ENV === 'development') {
    if (userId === 'Ua684ecb5c5d077e54d95a1d3ebaae15a') {
      client
        .replyMessage(event.replyToken, replyMessage)
        .then(() => {
          console.log(`Sent reply message to user: ${userId}`);
        })
        .catch(err => {
          console.error(err);
        });
    }
  } else {
    client
      .replyMessage(event.replyToken, replyMessage)
      .then(() => {
        console.log(`Sent reply message to user: ${userId}`);
      })
      .catch(err => {
        console.error(err);
      });
  }
};

// function for handling unsend events
export const handleUnsendEvent = (event: WebhookEvent): void => {
  console.log(`Unsend event received: ${JSON.stringify(event)}`);
  let target;

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
    client.pushMessage(target, createTextMessage('Ih apaan tuh diunsent'));
  }
};
