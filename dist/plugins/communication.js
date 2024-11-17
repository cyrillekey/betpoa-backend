"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const africastalking_1 = __importDefault(require("africastalking"));
const axios_1 = __importDefault(require("axios"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const configs_1 = require("../configs");
const sendSmsAfrikasTalking = async (fastify, phone, message) => {
    const atClient = (0, africastalking_1.default)({ apiKey: configs_1.configs.afrikasTalking.apiKey, username: configs_1.configs.afrikasTalking.username });
    const smsClient = atClient.SMS;
    try {
        const response = await smsClient.send({
            to: [fastify.helpers.formatPhoneNumber(phone)],
            message,
            from: configs_1.configs.afrikasTalking.senderId,
        });
        if (!response)
            return false;
        return true;
    }
    catch (error) {
        fastify.Sentry.captureException(error);
        return false;
    }
};
const sendSmsLeopardSms = async (fastify, phone, message) => {
    try {
        const config = {
            method: 'POST',
            url: 'https://api.smsleopard.com/v1/sms/send',
            auth: {
                username: configs_1.configs.smsLeopard.apiKey,
                password: configs_1.configs.smsLeopard.apiSecret,
            },
            data: {
                source: 'sms_test',
                message: message,
                destination: [
                    {
                        number: fastify.helpers.formatPhoneNumber(phone),
                    },
                ],
            },
        };
        const response = await (0, axios_1.default)(config)
            .then((resp) => {
            fastify.log.info(resp?.data);
            return true;
        })
            .catch((err) => {
            fastify.log.info(err?.response?.data);
            fastify.Sentry.captureException(err?.response?.data);
            return false;
        });
        return response;
    }
    catch (error) {
        return false;
    }
};
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    const sendSms = async (phone, message) => {
        try {
            switch (configs_1.configs.smsPlatform) {
                case 'smsleopard': {
                    const response = await sendSmsAfrikasTalking(fastify, phone, message);
                    return response;
                }
                case 'africastalking': {
                    const response = await sendSmsLeopardSms(fastify, phone, message);
                    return response;
                }
            }
        }
        catch (error) {
            return false;
        }
    };
    fastify.decorate('messaging', { sendSms });
});
//# sourceMappingURL=communication.js.map