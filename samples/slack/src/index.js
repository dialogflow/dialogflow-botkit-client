/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 

// Module must be started with environment variables
//
//  accesskey="api.ai client access key"
//  slackkey="slack bot key"
//

'use strict';

const Botkit = require('botkit');

const apiai = require('apiai');
const uuid = require('node-uuid');
const http = require('http');

const Entities = require('html-entities').XmlEntities;
const decoder = new Entities();

const apiAiAccessToken = process.env.accesstoken;
const slackBotKey = process.env.slackkey;

const apiAiService = apiai(apiAiAccessToken);

const sessionIds = new Map();

const controller = Botkit.slackbot({
    debug: false
    //include "log: false" to disable logging
});

var bot = controller.spawn({
    token: slackBotKey
}).startRTM();

controller.on('rtm_close', function (bot, err) {
    console.log('** The RTM api just closed, reason', err);
    
    try {

        // sometimes connection closing, so, we should restart bot
        if (bot.doNotRestart != true) {
            let token = bot.config.token;
            console.log('Trying to restart bot ' + token);

            restartBot(bot);
        }

    } catch (err) {
        console.error('Restart bot failed', err);
    }
});

function restartBot(bot) {
    bot.startRTM(function (err) {
        if (err) {
            console.error('Error restarting bot to Slack:', err);
        }
        else {
            let token = bot.config.token;
            console.log('Restarted bot for %s', token);
        }
    });
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

controller.hears(['.*'], ['direct_message', 'direct_mention', 'mention', 'ambient'], (bot, message) => {
    try {
        if (message.type == 'message') {
            if (message.user == bot.identity.id) {
                // message from bot can be skipped
            }
            else if (message.text.indexOf("<@U") == 0 && message.text.indexOf(bot.identity.id) == -1) {
                // skip other users direct mentions
            }
            else {

                let requestText = decoder.decode(message.text);
                requestText = requestText.replace("’", "'");

                let channel = message.channel;
                let messageType = message.event;
                let botId = '<@' + bot.identity.id + '>';
                let userId = message.user;

                console.log(requestText);
                console.log(messageType);

                if (requestText.indexOf(botId) > -1) {
                    requestText = requestText.replace(botId, '');
                }

                if (!sessionIds.has(channel)) {
                    sessionIds.set(channel, uuid.v1());
                }

                console.log('Start request ', requestText);
                let request = apiAiService.textRequest(requestText,
                    {
                        sessionId: sessionIds.get(channel),
                        contexts: [
                            {
                                name: "generic",
                                parameters: {
                                    slack_user_id: userId,
                                    slack_channel: channel
                                }
                            }
                        ]
                    });

                request.on('response', (response) => {
                    console.log(response);

                    if (isDefined(response.result)) {
                        let responseText = response.result.fulfillment.speech;
                        let responseData = response.result.fulfillment.data;

                        if (isDefined(responseData) && isDefined(responseData.slack)) {
                            replyWithData(bot, message, responseData);
                        } else if (isDefined(responseText)) {
                            replyWithText(bot, message, responseText);
                        }

                    }
                });

                request.on('error', (error) => console.error(error));
                request.end();
            }
        }
    } catch (err) {
        console.error(err);
    }
});

function replyWithText(bot, message, responseText) {
    bot.reply(message, responseText, (err, resp) => {
        if (err) {
            console.error(err);
        }
});
}

function replyWithData(bot, message, responseData) {
    try {
        bot.reply(message, responseData.slack);
    } catch (err) {
        bot.reply(message, err.message);
    }
}


//Create a server to prevent Heroku kills the bot
const server = http.createServer((req, res) => res.end());

//Lets start our server
server.listen((process.env.PORT || 5000), () => console.log("Server listening"));