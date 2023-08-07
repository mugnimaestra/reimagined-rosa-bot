import axios, { AxiosResponse } from "axios";
import fs from "fs";
import bypassDoodStreamLink from "./bypassDoodStreamLink";
import TelegramBot from "node-telegram-bot-api";

type downloadDoodStreamLinkProps = {
  url: string;
  options?: {
    telegramInstanceBot: TelegramBot;
    telegramchatId: number;
  };
};

async function downloadDoodStreamLink({
  url,
  options,
}: downloadDoodStreamLinkProps): Promise<string> {
  const teleBot = options?.telegramInstanceBot;
  const telegramChatId = options?.telegramchatId;
  try {
    const doodStreamResponse = await bypassDoodStreamLink(url);
    const videoStream = await getVideoStream(
      doodStreamResponse.data.direct_link,
      progressEvent => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Downloading video: ${percentage}%`);
        if (teleBot && telegramChatId) {
          teleBot
            .sendMessage(telegramChatId, `Downloading video: ${percentage}%`)
            .then(msg => {
              // Store the message ID to update it later
              const messageId = msg.message_id;

              // Update the message text as download progresses
              teleBot.editMessageText(`Downloading video: ${percentage}%`, {
                chat_id: telegramChatId,
                message_id: messageId,
              });
            });
        }
      }
    );
    const title = doodStreamResponse.data.title;
    const filename = title.replace(/[/\\?%*:|"<>]/g, "_") + ".mp4"; // Sanitize title for filename
    fs.writeFileSync(filename, videoStream);
    console.log(`Video stream saved as ${filename}`);
    if (teleBot && telegramChatId) {
      teleBot?.sendMessage(telegramChatId, `Video stream saved as ${filename}`);
    }
    return filename;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

async function getVideoStream(
  url: string,
  onProgress?: (progressEvent: any) => void
): Promise<Buffer> {
  const headers = {
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Connection: "keep-alive",
    Origin: "https://teradood.hunternblz.com",
    Referer: "https://teradood.hunternblz.com/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36 Edg/115.0.1901.188",
    "sec-ch-ua":
      '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
  };

  try {
    const response: AxiosResponse<Buffer> = await axios.get(url, {
      headers,
      responseType: "arraybuffer",
      onDownloadProgress: onProgress,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch video stream");
  }
}

export default downloadDoodStreamLink;

// TODO: PASS THE DOWNLOAD PROGRESS TO THE BOT AND EDIT THE MESSAGE AS THE DOWNLOADING VIDEO IS PROGRESSING
