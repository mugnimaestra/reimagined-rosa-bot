import express, { Request, Response, NextFunction } from 'express';
import { Client, WebhookEvent, MessageEvent, TextMessage } from '@line/bot-sdk';
import dotenv from 'dotenv';

if (!process.env.LINE_CHANNEL_SECRET) {
  dotenv.config();
}

const app = express();
const client = new Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_ACCESS_TOKEN!,
});

app.use(express.json());

// error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// webhook endpoint for handling incoming messages
app.post('/webhook', (req: Request, res: Response) => {
  const events: WebhookEvent[] = req.body.events;

  events.forEach(event => {
    switch (event.type) {
      case 'message':
        handleTextMessage(event as MessageEvent);
        break;
      case 'unsend':
        handleUnsendEvent(event);
        break;
      default:
        console.log(`Unknown event: ${event.type}`);
    }
  });

  res.sendStatus(200);
});

app.get('*', (req: Request, res: Response) => {
  // Set the response HTTP header with HTTP status and Content type
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Send the response body "Hello World"
  res.end('Rosa bot is running\n');
});

// function for handling incoming text messages
const handleTextMessage = (event: MessageEvent): void => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text messages
    return;
  }

  const userId = event.source.userId;
  const message = event.message.text;

  const replyMessage = createReplyMessage(message);

  console.log('process.env =', process.env.NODE_ENV, 'userId =', userId);

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
const handleUnsendEvent = (event: WebhookEvent): void => {
  console.log(`Unsend event received: ${JSON.stringify(event)}`);
};

// function for creating a reply message
const createReplyMessage = (message: string): TextMessage => {
  return {
    type: 'text',
    text: `Kamu bilang: ${message}`,
  };
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
