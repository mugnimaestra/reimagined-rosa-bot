import express, { Request, Response, NextFunction } from 'express';
import { WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { handleTextMessage, handleUnsendEvent } from './bot.js';

const app = express();

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
