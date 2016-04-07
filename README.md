# api-ai-botkit

[![npm](https://img.shields.io/npm/v/api-ai-botkit.svg)](https://www.npmjs.com/package/api-ai-botkit)

Utility lib for creating Slack bots

For usage sample code see `examples/sample_bot.js`

## Steps for using lib

Import Library
```js
const apiaibotkit = require('api-ai-botkit');
```

Create `apiai` object using token from http://api.ai website
```js
const apiai = apiaibotkit(apiaiToken);
```

Use `apiai` object in `controller.hears`
```js
controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    apiai.process(message, bot);
});
```

Implement different reactions to appropriate actions
```js
apiai
    .action('smalltalk.greetings', function (message, resp, bot) {
        var responseText = resp.result.fulfillment.speech;
        bot.reply(message, responseText);
    })
    .action('input.unknown', function (message, resp, bot) {
        bot.reply(message, "Sorry, I don't understand");
    });
```
