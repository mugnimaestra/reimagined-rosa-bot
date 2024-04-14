import express, { Request, Response, NextFunction } from "express";
import { WebhookEvent, MessageEvent } from "@line/bot-sdk";
import { handleTextMessage } from "./src/bot";
import { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();

app.use(express.json());

// error handling middleware
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// webhook endpoint for handling incoming Line Messenger messages
app.post("/webhook", (req: Request, res: Response) => {
  const events: WebhookEvent[] = req.body.events;

  events.forEach(event => {
    switch (event.type) {
      case "message":
        handleTextMessage(event as MessageEvent);
        break;
        // case 'unsend':
        //   handleUnsendEvent(event);
        break;
      default:
        console.log(`Unknown event: ${event.type}`);
    }
  });

  res.sendStatus(200);
});

// Root endpoint for checking server status
app.get("*", (req: Request, res: Response) => {
  res.status(200).send("Rosa bot is running");
});

// Vercel serverless function export
export default (req: VercelRequest, res: VercelResponse) => {
  if (req.method) {
    app(req as unknown as Request, res as unknown as Response, () =>
      res.status(404).end()
    );
  }
};

// Traditional server setup is not required for Vercel deployment but can be retained for local development
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
