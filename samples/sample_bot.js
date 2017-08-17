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

'use strict';

const Botkit = require('botkit');
const apiaibotkit = require('../api-ai-botkit');

const slackToken = process.env.SLACK_TOKEN;
const apiaiToken = process.env.APIAI_TOKEN;

const apiai = apiaibotkit(apiaiToken);
const controller = Botkit.slackbot();

controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    apiai.process(message, bot);
});

controller.on('reaction_added', function (bot, message) {
   console.log(message);
});

apiai.all(function (message, resp, bot) {
    console.log(resp.result.action);
});

apiai
    .action('smalltalk.greetings', function (message, resp, bot) {
        let responseText = resp.result.fulfillment.speech;
        bot.reply(message, responseText);
    })
    .action('input.unknown', function (message, resp, bot) {
        bot.reply(message, "Sorry, I don't understand");
    });

controller.spawn({
    token: slackToken
}).startRTM();