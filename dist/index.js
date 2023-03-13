'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const bot_1 = require('./bot');
const app = (0, express_1.default)();
app.use(express_1.default.json());
// error handling middleware
app.use((err, _, res, __) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// webhook endpoint for handling incoming messages
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  events.forEach(event => {
    switch (event.type) {
      case 'message':
        (0, bot_1.handleTextMessage)(event);
        break;
      case 'unsend':
        (0, bot_1.handleUnsendEvent)(event);
        break;
      default:
        console.log(`Unknown event: ${event.type}`);
    }
  });
  res.sendStatus(200);
});
app.get('*', (req, res) => {
  res.status(200).send('Rosa bot is running');
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
//# sourceMappingURL=index.js.map
