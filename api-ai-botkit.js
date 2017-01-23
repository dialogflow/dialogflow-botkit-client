'use strict';

const Botkit = require('botkit');
const apiai = require('apiai');

const uuidV4 = require('uuid/v4');
const Entities = require('html-entities').XmlEntities;
const decoder = new Entities();

module.exports = function (apiaiToken) {
    return createApiAiProcessing(apiaiToken);
};

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

function createApiAiProcessing(token) {
    let worker = {};

    worker.apiaiService = apiai(token);
    worker.sessionIds = {};

    worker.actionCallbacks = {};
    worker.allCallback = [];

    worker.action = function (action, callback) {
        if (worker.actionCallbacks[action]) {
            worker.actionCallbacks[action].push(callback);
        } else {
            worker.actionCallbacks[action] = [callback];
        }

        return worker;
    };

    worker.all = function (callback) {
        worker.allCallback.push(callback);
        return worker;
    };


    worker.process = function (message, bot) {
        try {

            if (isDefined(message.text)) {
                let userId = message.user;

                let requestText = decoder.decode(message.text);
                requestText = requestText.replace("’", "'");

                if (isDefined(bot.identity) && isDefined(bot.identity.id)) {
                    // it seems it is Slack

                    if (message.user == bot.identity.id) {
                        // message from bot can be skipped
                        return;
                    }

                    if (message.text.indexOf("<@U") == 0 && message.text.indexOf(bot.identity.id) == -1) {
                        // skip other users direct mentions
                        return;
                    }

                    let botId = '<@' + bot.identity.id + '>';
                    if (requestText.indexOf(botId) > -1) {
                        requestText = requestText.replace(botId, '');
                    }

                    userId = message.channel;
                }

                if (!(userId in worker.sessionIds)) {
                    worker.sessionIds[userId] = uuidV4();
                }

                let request = worker.apiaiService.textRequest(requestText,
                    {
                        sessionId: worker.sessionIds[userId],
                        originalRequest: {
                            data: message,
                            source: "api-ai-botkit"
                        }
                    });

                request.on('response', (response) => {

                    worker.allCallback.forEach((callback) => {
                        callback(message, response, bot);
                    });

                    if (isDefined(response.result)) {
                        let action = response.result.action;

                        if (isDefined(action)) {
                            if (worker.actionCallbacks[action]) {
                                worker.actionCallbacks[action].forEach((callback) => {
                                    callback(message, response, bot);
                                });
                            }
                        }
                    }
                });

                request.on('error', (error) => {
                    console.error(error);
                });

                request.end();
            }

        } catch (err) {
            console.error(err);
        }
    };

    return worker;
}