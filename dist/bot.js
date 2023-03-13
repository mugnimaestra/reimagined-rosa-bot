'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.handleUnsendEvent =
  exports.handleTextMessage =
  exports.createTextMessage =
  exports.client =
    void 0;
const bot_sdk_1 = require('@line/bot-sdk');
const dotenv_1 = __importDefault(require('dotenv'));
if (!process.env.LINE_CHANNEL_SECRET) {
  dotenv_1.default.config();
}
exports.client = new bot_sdk_1.Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
});
// function for creating a reply message
const createTextMessage = (message, mentions) => {
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
exports.createTextMessage = createTextMessage;
const mainFunction = event => {
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
    exports.client.replyMessage(
      event.replyToken,
      (0, exports.createTextMessage)(message)
    );
  }
};
// function for handling incoming text messages
const handleTextMessage = event => {
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
exports.handleTextMessage = handleTextMessage;
// function for handling unsend events
const handleUnsendEvent = event =>
  __awaiter(void 0, void 0, void 0, function* () {
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
        yield exports.client.getProfile(event.source.userId).then(res => {
          console.log('user profile info', res);
          displayName = res.displayName;
        });
      }
      exports.client.pushMessage(
        target,
        (0, exports.createTextMessage)(
          `Wah, ${
            displayName !== null && displayName !== void 0
              ? displayName
              : 'anon'
          } unsent apa tuh`
        )
      );
    }
  });
exports.handleUnsendEvent = handleUnsendEvent;
//# sourceMappingURL=bot.js.map
