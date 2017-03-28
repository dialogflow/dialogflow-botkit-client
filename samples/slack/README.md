# Api.ai Slack Integration

## Overview

Api.ai Slack integration allows you to create Slack bots with natural language understanding based on Api.ai technology.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

To launch a bot, you’ll need the Linux OS. To launch it in other operating systems, use [Docker Toolbox](https://www.docker.com/products/docker-toolbox).

Api.ai documentation:

- [How to create an Api.ai agent](https://docs.api.ai/docs/get-started#step-1-create-agent)
- [How to obtain Api.ai authentication keys](https://docs.api.ai/docs/authentication)

You’ll need 2 keys:

- Client access token for Api.ai
- Slack bot API token

To obtain a Slack bot API token, create a new bot integration here: https://slack.com/apps/A0F7YS25R-bots.

## Bot Launch

To launch the bot, use one of the following commands:

**For background launch mode (-d parameter):**

```sh
docker run -d --name slack_bot \
           -e accesstoken="api.ai access key" \
           -e slackkey="slack bot key" \
           speaktoit/api-ai-slack-bot
```

**For interactive launch mode (-it parameter):**

```sh
docker run -it --name slack_bot \
           -e accesstoken="Api.ai client access key" \
           -e slackkey="Slack bot user key" \
           speaktoit/api-ai-slack-bot
```

To stop the bot from running in the interactive mode, press CTRL+C.

In the background mode, you can control the bot’s state via simple commands:


- `docker start slack_bot`
- `docker stop slack_bot`,

where `slack_bot` is the container name from the `run` command.

## Custom Bot Launch

If you want to customize your bot behavior, follow the steps below.

1. Clone the repository https://github.com/api-ai/api-ai-slack-bot 

2. Change the code to `index.js`

3. In the Docker, use the `run` command specifying the full path to the directory containing the `index.js` file:

```sh
docker run -d --name slack_bot \
           -e accesstoken="Api.ai client token" \
           -e slackkey="Slack bot user key" \
           -v /full/path/to/your/src:/usr/app/src \
           speaktoit/api-ai-slack-bot
```

## Code Notes

Bot implementation is based on the Slack Botkit: https://github.com/howdyai/botkit.

Message processing is done by the following code:

```javascript
controller.hears(['.*'],['direct_message','direct_mention','mention', 'ambient'], function(bot,message) {
    console.log(message.text);
    if (message.type == "message") {
        if (message.user == bot.identity.id) {
            // message from bot can be skipped
        }
        else {
            var requestText = message.text;
            var channel = message.channel;
            if (!(channel in sessionIds)) {
                sessionIds[channel] = uuid.v1();
            }
            var request = apiAiService.textRequest(requestText, { sessionId: sessionIds[channel] });
            request.on('response', function (response) {
                console.log(response);
                if (response.result) {
                    var responseText = response.result.fulfillment.speech;
                    if (responseText) {
                        bot.reply(message, responseText);
                    }
                }
            });
            request.on('error', function (error) {
                console.log(error);
            });
            request.end();
        }
    }
});
```

This code extracts the text from each message:

`var requestText = message.text;`

And sends it to Api.ai:

`var request = apiAiService.textRequest(requestText, { sessionId: sessionIds[channel] });`

If a non-empty response is received from Api.ai, the bot will respond with the received text:

`bot.reply(message, responseText);`
