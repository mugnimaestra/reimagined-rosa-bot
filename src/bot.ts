import { Client, MessageEvent, WebhookEvent } from '@line/bot-sdk';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { Mention, MentionTextMessage } from '../types.js';
import { reelUrlRegex, teraboxUrlRegex } from './constant';
import {
  downloadReels,
  pickAnOption,
  extractTeraboxDirectLink,
} from './functions';

if (!process.env.LINE_CHANNEL_SECRET) {
  dotenv.config();
}

// #1 LINE Messenger Bot Section

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

  // #3 extract direct url from terabox
  if ((event.message.text.match(teraboxUrlRegex) ?? '')?.length > 0) {
    const teraboxUrl = event.message.text.match(teraboxUrlRegex)?.[0];
    if (typeof teraboxUrl === 'string') {
      const directFileUrl = await extractTeraboxDirectLink(teraboxUrl);
      message = directFileUrl;
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

// #2 Telegram Bot Section

// webhook endpoint for handling incoming Telegram updates
export const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: true,
});

telegramBot.onText(/^\/terabox (.+)/, async (message, match) => {
  const teraboxUrl = (match ?? [])[1];
  const teraboxResponse = await extractTeraboxDirectLink(teraboxUrl);

  // create the inline keyboard with the direct link as a callback query data
  // create the inline keyboard with the direct link as an href URL button
  const inlineKeyboard: InlineKeyboardButton[][] = [
    [
      {
        text: '✅ Download the file',
        url: teraboxResponse.directUrl,
      },
    ],
  ];

  // send a message with the inline keyboard to the chat where the command was sent
  telegramBot.sendMessage(
    message.chat.id,
    `Here's the direct link for file\nTitle: ${teraboxResponse.rawResponse?.title}`,
    {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
      reply_to_message_id: message.message_id,
    }
  );
});

telegramBot.on('polling_error', error => {
  console.error(error.message);
});
