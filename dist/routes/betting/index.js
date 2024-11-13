"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BettingController_1 = __importDefault(require("@controllers/BettingController"));
const response_1 = require("@controllers/interface/response");
const Auth_1 = require("@hooks/Auth");
const bettingRoute = async (fastify) => {
    fastify.route({
        method: 'POST',
        url: '/',
        preHandler: Auth_1.isAuthorized,
        schema: {
            summary: 'Place Bet',
            description: 'Customer place bet for the currently logged in user',
            tags: ['Bet'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['data', 'amount'],
                properties: {
                    amount: { type: 'number' },
                    data: {
                        type: 'array',
                        items: { properties: response_1.IPlaceBetInput, type: 'object', required: ['fixtureId', 'oddsId', 'pick'] },
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: response_1.ISuccessResponse,
                },
                default: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: response_1.ISuccessResponse,
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => await new BettingController_1.default(fastify, req, res).placeBet(),
    });
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        preHandler: Auth_1.isAuthorized,
        schema: {
            summary: 'Cancel Bet',
            description: 'Cancel customer placed bet if bet is within the allowed cancellation window for the currently logged in user',
            tags: ['Bet'],
            params: {
                id: { type: 'number' },
            },
            response: {
                200: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: response_1.ISuccessResponse,
                },
                default: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: response_1.ISuccessResponse,
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => await new BettingController_1.default(fastify, req, res).cancelBet(),
    });
    fastify.route({
        method: 'GET',
        url: '/',
        preHandler: Auth_1.isAuthorized,
        schema: {
            summary: 'Customer bets',
            description: 'Get all placed bet for the currently logged in user',
            tags: ['Bet'],
            querystring: {
                from: { type: 'string' },
                to: { type: 'string' },
                status: { type: 'array', items: { type: 'string', enum: ['WON', 'LOST', 'VOID', 'PENDING', 'CANCELLED'] } },
            },
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: { ...response_1.ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: response_1.BetResponseBody } } },
                },
                default: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: { ...response_1.ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: response_1.BetResponseBody } } },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => await new BettingController_1.default(fastify, req, res).getGets(),
    });
    fastify.route({
        method: 'GET',
        url: '/:id',
        preHandler: Auth_1.isAuthorized,
        schema: {
            summary: 'Customer single bet',
            description: 'Get single customer bet by bet id',
            tags: ['Bet'],
            params: {
                id: { type: 'number' },
            },
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: { ...response_1.ISuccessResponse, data: { type: 'object', properties: response_1.BetResponseBody } },
                },
                default: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: { ...response_1.ISuccessResponse, data: { type: 'object', properties: response_1.BetResponseBody } },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => await new BettingController_1.default(fastify, req, res).getBet(),
    });
    fastify.route({
        method: 'GET',
        url: '/:id/items',
        preHandler: Auth_1.isAuthorized,
        schema: {
            tags: ['Bet'],
            summary: 'Bet Items',
            description: 'Get all items in a placed bet',
            security: [{ bearerAuth: [] }],
            params: {
                id: { type: 'number' },
            },
            response: {
                200: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: { ...response_1.ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: response_1.BetMarketOddsReponse } } },
                },
                default: {
                    type: 'object',
                    description: 'SuccessReponse',
                    properties: { ...response_1.ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: response_1.BetMarketOddsReponse } } },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => await new BettingController_1.default(fastify, req, res).getBetItems(),
    });
};
exports.default = bettingRoute;
//# sourceMappingURL=index.js.map