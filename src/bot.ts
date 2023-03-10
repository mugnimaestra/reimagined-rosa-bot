import dotenv from 'dotenv';
import { Client, TextMessage, UnsendEvent } from '@line/bot-sdk';

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

// function for handling unsend events
export const handleUnsendEvent = (event: UnsendEvent): void => {
  console.log(`Unsend event received: ${JSON.stringify(event)}`);
  let target;
  let displayName;
  switch (event.source.type) {
    case 'user':
      {
        target = event.source.userId;
        client.getProfile(event.source.userId).then(res => {
          displayName = res.displayName;
        });
      }
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
    client.pushMessage(target, createTextMessage('Ih apa tuh diunsent'));
  }
};
