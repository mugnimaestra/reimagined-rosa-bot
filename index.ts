import express, { Request, Response, NextFunction } from 'express';
import { WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { handleTextMessage, handleUnsendEvent } from './bot.js';


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

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
