import express, { Request, Response } from 'express';
import { WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { client, createTextMessage, handleUnsendEvent } from '@/bot';

const app = express();

app.use(express.json());

// error handling middleware
app.use((err: Error, _: Request, res: Response) => {
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
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Rosa bot is running');
});

// function for handling incoming text messages
const handleTextMessage = (event: MessageEvent): void => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text messages
    return;
  }

  const userId = event.source.userId;
  const message = event.message.text;

  const replyMessage = createTextMessage(message);

  if (process.env.NODE_ENV === 'development') {
    if (userId === 'Ua684ecb5c5d077e54d95a1d3ebaae15a') {
      // this make the bot only listen to my account
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
