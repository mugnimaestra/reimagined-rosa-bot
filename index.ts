import express, { Request, Response, NextFunction } from 'express';
import { WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { handleTextMessage, handleUnsendEvent } from './src/bot';

const app = express();

app.use(express.json());

// error handling middleware
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// webhook endpoint for handling incoming Line Messenger messages
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

// Root endpoint for checking server status
app.get('*', (req: Request, res: Response) => {
  res.status(200).send('Rosa bot is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
