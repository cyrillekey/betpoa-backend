"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token = void 0;
const index_1 = require("@configs/index");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.token = {
    sign: (options) => {
        if (!options?.id || !options?.role) {
            throw new Error('Expects email, account type and id in payload.');
        }
        return jsonwebtoken_1.default.sign(options, index_1.configs.jwtsecret);
    },
    verify: (tokenValue) => {
        try {
            return jsonwebtoken_1.default.verify(tokenValue, index_1.configs.jwtsecret);
        }
        catch (error) {
            return null;
        }
    },
};
const formatPhoneNumber = (phone) => {
    if (phone.startsWith('0')) {
        phone = phone.replace('0', '254');
    }
    else if (phone.startsWith('+')) {
        phone = phone.substring(1);
    }
    else if (phone.startsWith('0110') || phone.startsWith('0111')) {
        phone = phone.replace('0', '254');
    }
    else if (phone.startsWith('7')) {
        phone = '254' + phone;
    }
    return phone;
};
const formatCurrency = ({ currency, amount }) => {
    return Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
};
const validateEmailAddress = (email = '') => {
    email = email.replace(/\s/g, '').toLowerCase();
    if (!email) {
        return false;
    }
    return /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);
};
const validatePhoneNumber = (phone) => {
    return /^\d{12}$/.test(formatPhoneNumber(phone));
};
exports.default = (0, fastify_plugin_1.default)(async (fastify, _opts) => {
    fastify.decorate('helpers', { formatPhoneNumber, formatCurrency, validateEmailAddress, validatePhoneNumber, jwt: exports.token });
});
//# sourceMappingURL=support.js.map