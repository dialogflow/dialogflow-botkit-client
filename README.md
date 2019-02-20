# DEPRECATED api-ai-botkit

| Deprecated |
|-------|
| This Dialogflow client library and Dialogflow API V1 [have been deprecated and will be shut down on October 23th, 2019](https://blog.dialogflow.com/post/migrate-to-dialogflow-api-v2/). Please migrate to Dialogflow API V2 and the [v2 client library](https://cloud.google.com/dialogflow-enterprise/docs/reference/libraries/nodejs) |

[![npm](https://img.shields.io/npm/v/api-ai-botkit.svg)](https://www.npmjs.com/package/api-ai-botkit)

Utility lib for creating bots. So far only tested with Slack.

For usage sample code see `examples/sample_bot.js`

## Steps for using lib

Install library from npm
```sh
npm install --save api-ai-botkit
```

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
## License
See [LICENSE](LICENSE).

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).

This is not an official Google product.
