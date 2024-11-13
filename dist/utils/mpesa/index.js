"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@configs/index");
const Sentry = __importStar(require("@sentry/node"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const dayjs_1 = __importDefault(require("dayjs"));
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
class MpesaLibrary {
    static baseUrl = process.env.NODE_ENV == 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
    static certPath = process.env.NODE_ENV == 'production'
        ? (0, path_1.join)(process.cwd(), 'conf', 'ProductionCertificate.cer')
        : (0, path_1.join)(process.cwd(), 'conf', 'SandboxCertificate.cer');
    static async authenticate() {
        try {
            const token = btoa(`${index_1.configs.mpesa.consumerKey}:${index_1.configs.mpesa.consumerSecret}`);
            const config = {
                method: 'get',
                url: `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                headers: {
                    Authorization: `Basic ${token}`,
                },
            };
            const authToken = await (0, axios_1.default)(config)
                .then((result) => {
                return result?.data['access_token'];
            })
                ?.catch((err) => {
                Sentry.captureException(err);
                return null;
            });
            return authToken;
        }
        catch (err) {
            Sentry.captureException(err);
            return null;
        }
    }
    static generateSecurityCredentials() {
        try {
            const bufferToEncrypt = Buffer.from(index_1.configs.mpesa.initiatorPassword, 'utf-8');
            const data = (0, fs_1.readFileSync)((0, path_1.resolve)(this.certPath), 'utf-8');
            const privateKey = String(data);
            const encrypted = (0, crypto_1.publicEncrypt)({
                key: privateKey,
                padding: crypto_1.constants.RSA_PKCS1_PADDING,
            }, bufferToEncrypt);
            return encrypted.toString('base64');
        }
        catch (error) {
            Sentry.captureException(error);
            return null;
        }
    }
    static generateMpesaPassword() {
        const timestamp = (0, dayjs_1.default)().format('YYYYMMDDhhmmss').toString();
        const password = btoa(`${index_1.configs.mpesa.shortCode}${index_1.configs.mpesa.passKey}${timestamp}`);
        return {
            timestamp,
            password,
        };
    }
    static formatPhoneNumber(phone) {
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
        return parseInt(phone.trim());
    }
    static async initiateMpesaStkPush({ phone, amount, uniqueId, callbackUrl, }) {
        try {
            const authToken = await this.authenticate();
            const authentication = this.generateMpesaPassword();
            const body = JSON.stringify({
                BusinessShortCode: Number(index_1.configs.mpesa.shortCode),
                Password: authentication.password,
                Timestamp: authentication.timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Number(amount),
                PartyA: this.formatPhoneNumber(phone),
                PartyB: index_1.configs.mpesa.shortCode,
                PhoneNumber: this.formatPhoneNumber(phone),
                CallBackURL: `${index_1.configs.stkCallbackUrl}${callbackUrl ?? '/api/c2b/stk-callback'}`,
                AccountReference: 'iFunza',
                TransactionDesc: uniqueId,
            });
            const response = await axios_1.default
                .post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            })
                ?.then((resp) => {
                return resp?.data;
            })
                ?.catch((err) => {
                Sentry.captureException(err, {
                    extra: {
                        data: err?.response?.data,
                    },
                });
                return { ResponseCode: '1', CustomerMessage: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong' };
            });
            if (response?.ResponseCode == '0') {
                return {
                    success: true,
                    message: response?.CustomerMessage ?? 'Success! Mpesa initiated',
                    CheckoutRequestID: `${response?.CheckoutRequestID}`,
                    MerchantRequestID: `${response?.MerchantRequestID}`,
                };
            }
            else {
                return {
                    success: false,
                    message: response?.CustomerMessage ?? 'Failed! Something went wrong please try again',
                };
            }
        }
        catch (error) {
            Sentry.captureException(error);
            return {
                success: false,
                message: 'Failed! Could Not Intiate Mpesa Transaction',
            };
        }
    }
    static async checkLipaNaMpesaStatus(checkoutRequestID) {
        try {
            const authToken = await this.authenticate();
            const authentication = this.generateMpesaPassword();
            const response = await axios_1.default
                .post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
                BusinessShortCode: index_1.configs.mpesa.shortCode,
                Password: authentication.password,
                Timestamp: authentication.timestamp,
                CheckoutRequestID: checkoutRequestID,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            })
                ?.then((resp) => {
                return resp?.data;
            })
                ?.catch((err) => {
                Sentry.captureException(err);
                return {
                    ResultCode: '1',
                    ResponseCode: '1',
                    ResultDesc: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong',
                };
            });
            if (response?.ResponseCode == '0') {
                if (response?.ResultCode == '0') {
                    return {
                        stkPushSuccess: true,
                        callbackSuccess: true,
                        CheckoutRequestID: `${response?.CheckoutRequestID}`,
                        MerchantRequestID: `${response?.MerchantRequestID}`,
                        ResponseCode: response?.ResponseCode,
                        ResponseDescription: `${response?.ResponseDescription}`,
                        ResultCode: response?.ResultCode,
                        ResultDesc: `${response?.ResultDesc}`,
                    };
                }
                else {
                    return {
                        stkPushSuccess: true,
                        callbackSuccess: false,
                        CheckoutRequestID: response?.CheckoutRequestID,
                        MerchantRequestID: response?.MerchantRequestID,
                        ResponseCode: response?.ResponseCode,
                        ResponseDescription: response?.ResponseDescription,
                        ResultCode: response?.ResultCode,
                        ResultDesc: response?.ResultDesc,
                    };
                }
            }
            else {
                return {
                    stkPushSuccess: false,
                    callbackSuccess: false,
                    CheckoutRequestID: response?.CheckoutRequestID,
                    MerchantRequestID: response?.MerchantRequestID,
                    ResponseCode: response?.ResponseCode,
                    ResponseDescription: response?.ResponseDescription,
                    ResultCode: response?.ResultCode,
                    ResultDesc: response?.ResultDesc,
                };
            }
        }
        catch (error) {
            Sentry.captureException(error);
            return {
                stkPushSuccess: false,
                callbackSuccess: false,
                ResponseDescription: 'Failed! Could Not Verify Transaction',
                ResultDesc: 'Failed! Could Not Verify Transaction',
                CheckoutRequestID: checkoutRequestID,
                MerchantRequestID: null,
                ResponseCode: '1032',
                ResultCode: '1032',
            };
        }
    }
    static async payoutToPayBill({ amount, receiverPaybill, accountName, }) {
        try {
            const config = {
                OriginatorConversationID: (0, uuid_1.v4)(),
                Initiator: index_1.configs.mpesa.initiatorName,
                SecurityCredential: this.generateSecurityCredentials(),
                CommandID: 'BusinessPayBill',
                SenderIdentifierType: '4',
                RecieverIdentifierType: '4',
                Amount: amount,
                PartyA: index_1.configs.mpesa.shortCode,
                PartyB: receiverPaybill,
                AccountReference: accountName,
                Remarks: 'ok',
                QueueTimeOutURL: `${index_1.configs.stkCallbackUrl}/api/mpesa/paybilltimeout`,
                ResultURL: `${index_1.configs.stkCallbackUrl}/api/mpesa/payouttotaybill`,
            };
            const authToken = await this.authenticate();
            const response = await axios_1.default
                .post(`${this.baseUrl}/mpesa/b2b/v1/paymentrequest`, config, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            })
                ?.then((resp) => resp?.data)
                ?.catch((err) => {
                Sentry.captureException(err);
                return {
                    ConversationID: null,
                    ResponseCode: '1',
                    ResponseDescription: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong',
                };
            });
            return response;
        }
        catch (error) {
            Sentry.captureException(error);
            return {
                ConversationID: null,
                ResponseCode: '1',
                OriginatorConversationID: null,
                ResponseDescription: 'Failed! Something went wrong',
            };
        }
    }
    static async payoutToBuyGoods({ amount, receiverBuyGoods }) {
        try {
            const data = {
                OriginatorConversationID: (0, uuid_1.v4)(),
                Initiator: index_1.configs.mpesa.initiatorName,
                SecurityCredential: this.generateSecurityCredentials(),
                CommandID: 'BusinessBuyGoods',
                SenderIdentifierType: '4',
                RecieverIdentifierType: '4',
                Amount: amount,
                PartyA: index_1.configs.mpesa.shortCode,
                PartyB: receiverBuyGoods,
                Remarks: 'ok',
                QueueTimeOutURL: `${index_1.configs.stkCallbackUrl}/api/mpesa/buygoodstimeout`,
                ResultURL: `${index_1.configs.stkCallbackUrl}/api/mpesa/payoutbuygoods`,
            };
            const authToken = await this.authenticate();
            const response = await axios_1.default
                .post(`${this.baseUrl}/mpesa/b2b/v1/paymentrequest`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            })
                ?.then((resp) => resp?.data)
                ?.catch((err) => {
                Sentry.captureException(err, {
                    extra: {
                        data: err?.response?.data,
                    },
                });
                return {
                    ConversationID: null,
                    ResponseCode: '1',
                    ResponseDescription: err?.response?.data?.errorMessage ?? 'Error! Something went wrong please try again',
                };
            });
            return response;
        }
        catch (error) {
            Sentry.captureException(error);
            return {
                ConversationID: null,
                ResponseCode: '1',
                OriginatorConversationID: null,
                ResponseDescription: 'Failed! Something went wrong',
            };
        }
    }
    static async payoutToMobileNumber({ phone, amount, reference, remarks, }) {
        try {
            const authentication = await this.authenticate();
            const body = {
                OriginatorConversationID: reference ?? (0, uuid_1.v4)(),
                InitiatorName: index_1.configs.mpesa.initiatorName,
                SecurityCredential: this.generateSecurityCredentials(),
                CommandID: 'BusinessPayment',
                Amount: amount,
                PartyA: index_1.configs.mpesa.shortCode,
                PartyB: this.formatPhoneNumber(phone),
                Remarks: remarks ?? 'Test remarks',
                QueueTimeOutURL: `${index_1.configs.stkCallbackUrl}/api/mpesa/mobiletimeout`,
                ResultURL: `${index_1.configs.stkCallbackUrl}/api/mpesa/mobileResult`,
                occasion: 'null',
            };
            const response = await axios_1.default
                .post(`${this.baseUrl}/mpesa/b2c/v3/paymentrequest`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authentication}`,
                },
            })
                ?.then((resp) => resp?.data)
                .catch((err) => {
                Sentry.captureException(err, {
                    extra: {
                        response: err?.response?.data,
                    },
                });
                return {
                    ConversationID: null,
                    OriginatorConversationID: null,
                    ResponseCode: '1',
                    ResponseDescription: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong please try again',
                };
            });
            return response;
        }
        catch (error) {
            Sentry.captureException(error);
            return {
                ConversationID: null,
                OriginatorConversationID: null,
                ResponseCode: '1',
                ResponseDescription: 'Failed! Something went wrong please try again',
            };
        }
    }
}
exports.default = MpesaLibrary;
//# sourceMappingURL=index.js.map