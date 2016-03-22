'use strict';

const Botkit = require('botkit');
const apiaibotkit = require('../apiaibotkit');

const slackToken = process.env.SLACK_TOKEN;
const apiaiToken = process.env.APIAI_TOKEN;

var apiai = apiaibotkit(apiaiToken);
var controller = Botkit.slackbot();

controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    try {
        apiai.process(message, bot);
    } catch (err) {
        console.error(err);
    }
});

apiai.all(function (message, resp, bot) {
   console.log(resp.result.action);
});

apiai.action('smalltalk.greetings', function (message, resp, bot) {
    var responseText = resp.result.fulfillment.speech;
    bot.reply(message, responseText);
});

controller.spawn({
    token: slackToken
}).startRTM();