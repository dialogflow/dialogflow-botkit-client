'use strict';

const Botkit = require('botkit');
const apiai = require('apiai');

const uuid = require('node-uuid');
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

    worker.apiaiService = apiai(token, "subscription_key");
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

                    if (requestText.indexOf(botId) > -1) {
                        requestText = requestText.replace(botId, '');
                    }

                    if (!(channel in worker.sessionIds)) {
                        worker.sessionIds[channel] = uuid.v1();
                    }

                    let request = worker.apiaiService.textRequest(requestText,
                        {
                            sessionId: worker.sessionIds[channel]
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
            }
        } catch (err) {
            console.error(err);
        }
    };


    return worker;
}