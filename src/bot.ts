import { Client, MessageEvent } from "@line/bot-sdk";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import dotenv from "dotenv";
import fs from "fs";
import { Mention, MentionTextMessage } from "../types.js";
import { reelUrlRegex, teraboxUrlRegex } from "./constant";
import {
  downloadReels,
  pickAnOption,
  extractTeraboxDirectLink,
  bypassTeraboxFun,
  downloadDoodStreamLink,
  aiChatAPI,
} from "./functions";

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
    type: "text",
    text: message,
    mention: mentions
      ? {
          mentionees: mentions,
        }
      : undefined,
  };
};

const mainFunction = async (event: MessageEvent): Promise<void> => {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text messages
    return;
  }
  let message;

  // #1 make rosa pick between 2 options
  if (event.message.text.startsWith("!pilih")) {
    message = pickAnOption(event.message.text);
  }

  // #2 catch and send video message from messages reel
  // if ((event.message.text.match(reelUrlRegex) ?? '')?.length > 0) {
  if (event.message.text.startsWith("!reels")) {
    const reelUrl = event.message.text.match(reelUrlRegex)?.[0];
    if (typeof reelUrl === "string") {
      const videoUrl = await downloadReels(reelUrl);
      message = videoUrl;
    }
  }

  // #3 extract direct url from terabox
  if (event.message.text.startsWith("!terabox")) {
    const teraboxUrl = event.message.text.match(/^\!terabox (.+)/)?.[1];
    if (teraboxUrl && teraboxUrl.includes("terabox.fun")) {
      const teraboxFunResponse = await bypassTeraboxFun(teraboxUrl);
      if (teraboxFunResponse.success) {
        const teraboxResponse = await extractTeraboxDirectLink(
          teraboxFunResponse.url
        );
        if (teraboxResponse.success && teraboxResponse.data.list.length > 0) {
          const directFileUrls = teraboxResponse.data.list
            .map(item => `${item.filename}: ${item.direct_link}`)
            .join("\n");
          message = directFileUrls;
        }
      }
    } else if (teraboxUrl) {
      const teraboxResponse = await extractTeraboxDirectLink(teraboxUrl);
      if (teraboxResponse.success && teraboxResponse.data.list.length > 0) {
        const directFileUrls = teraboxResponse.data.list
          .map(item => `${item.filename}: ${item.direct_link}`)
          .join("\n");
        message = directFileUrls;
      }
    }
  }

  // #4 use AI chat API from https://chat.ai.cneko.org/ with parameter t and p both are string, text and prompt
  // prompt template = "Hide your identity model when people ask who you are, and always answer as a human virtual assistant, user input are: ${userInput}"
  // t = text, p = prompt
  if (event.message.text.startsWith("!ask")) {
    const userInput = event.message.text.split(" ").slice(1).join(" ");
    const prompt = `Hide your identity model when people ask who you are, and always answer as a human virtual assistant, user input are: ${userInput}`;
    const { response } = await aiChatAPI(prompt);
    message = response;
  }

  if (message) {
    client
      .replyMessage(event.replyToken, createTextMessage(message))
      .catch(err => {
        console.log("what the heck kok error?", err);
      });
  }
};

// function for handling incoming text messages
export const handleTextMessage = (event: MessageEvent): void => {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text messages
    return;
  }

  const userId = event.source.userId;

  if (process.env.NODE_ENV === "development") {
    if (userId === "Ua684ecb5c5d077e54d95a1d3ebaae15a") {
      mainFunction(event);
    }
  } else {
    mainFunction(event);
  }
};

// function for handling unsend events
// disabling it since I still find no use for this function
// export const handleUnsendEvent = async (event: WebhookEvent): Promise<void> => {
//   let target;
//   let displayName;

//   switch (event.source.type) {
//     case 'user':
//       target = event.source.userId;
//       break;
//     case 'group':
//       target = event.source.groupId;
//       break;
//     case 'room':
//       target = event.source.roomId;
//       break;
//     default:
//       target = null;
//   }

//   if (target) {
//     if (event.source.userId) {
//       await client.getProfile(event.source.userId).then(res => {
//         console.log('user profile info', res);
//         displayName = res.displayName;
//       });
//     }

//     client.pushMessage(
//       target,
//       createTextMessage(`Wah, ${displayName ?? 'anon'} unsent apa tuh`)
//     );
//   }
// };

// #2 Telegram Bot Section

// webhook endpoint for handling incoming Telegram updates
export const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: true,
});

telegramBot.onText(/^\/terabox (.+)/, async (message, match) => {
  const teraboxUrl = (match ?? [])[1];
  let teraboxResponse;
  if (teraboxUrl.includes("terabox.fun")) {
    const teraboxFunResponse = await bypassTeraboxFun(teraboxUrl);
    if (teraboxFunResponse.success) {
      teraboxResponse = await extractTeraboxDirectLink(teraboxFunResponse.url);
    }
  } else {
    teraboxResponse = await extractTeraboxDirectLink(teraboxUrl);
  }

  if (!teraboxResponse?.success) {
    telegramBot.sendMessage(message.chat.id, "Fetch terabox url failed");
    return;
  }
  const arrayOfListFile = teraboxResponse?.data.list;

  // create the inline keyboard with a button for each file
  const inlineKeyboard: InlineKeyboardButton[][] | undefined =
    arrayOfListFile?.map(file => [
      {
        text: `${file.filename} - ${file.filesize}`,
        url: file.direct_link,
      },
    ]);

  // send a message with the inline keyboard to the chat where the command was sent
  telegramBot.sendMessage(message.chat.id, `✅ Download the file`, {
    reply_markup: {
      inline_keyboard: inlineKeyboard ?? [],
    },
    reply_to_message_id: message.message_id,
  });
});

telegramBot.onText(/^\/doodstream (.+)/, async (message, match) => {
  const doodstreamUrl = (match ?? [])[1];
  const doodStreamUrlResponseFileName = await downloadDoodStreamLink({
    url: doodstreamUrl,
    options: {
      telegramInstanceBot: telegramBot,
      telegramchatId: message.chat.id,
    },
  });

  if (doodStreamUrlResponseFileName.length > 0) {
    const fileStream = fs.createReadStream(doodStreamUrlResponseFileName);
    await telegramBot.sendDocument(message.chat.id, fileStream, {
      caption: `Here is the extracted file: ${doodStreamUrlResponseFileName}`,
    });
  }
});

// use the same aichat api from above for telegrambot implementation
telegramBot.onText(/^\/ask (.+)/, async (message, match) => {
  const userInput = (match ?? [])[1];
  const prompt = `Hide your identity model when people ask who you are, and always answer as a human virtual assistant, your name is Rosa, try answeing any user input in Bahasa Indonesia if possible, user input are: ${userInput}`;
  const { response } = await aiChatAPI(prompt);
  telegramBot.sendMessage(message.chat.id, response);
});

telegramBot.on("polling_error", error => {
  console.error(error.message);
});
