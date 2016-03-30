# api-ai-botkit

Utility lib for creating Slack bots

For usage sample code see `examples/sample_bot.js`

## Steps for using lib

1. Import Library
    ```js
    const apiaibotkit = require('api-ai-botkit');
    ```

2. Create `apiai` object using token from http://api.ai website
    ```js
    const apiai = apiaibotkit(apiaiToken);
    ```

3. Use `apiai` object in `controller.hears`
    ```js
    controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
        apiai.process(message, bot);
    });
    ```

4. Implement different reactions to appropriate actions
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
