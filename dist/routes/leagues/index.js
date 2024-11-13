"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("@controllers/interface/response");
const LeagueController_1 = __importDefault(require("@controllers/LeagueController"));
const Auth_1 = require("@hooks/Auth");
const leaguesQueries = async (fastify, _opts) => {
    fastify.route({
        url: '/',
        method: 'GET',
        schema: {
            summary: 'Get Leagues',
            description: 'Get all active leagues',
            tags: ['League'],
            querystring: {
                pageSize: { type: 'number' },
                page: { type: 'number' },
                year: { type: 'string' },
                country: { type: 'string' },
                featured: { type: 'boolean' },
            },
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                properties: response_1.ILeagueResponseBody,
                            },
                        },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                properties: response_1.ILeagueResponseBody,
                            },
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => await new LeagueController_1.default(fastify, req, res).getAllLeagues(),
    });
    fastify.route({
        url: '/:id',
        method: 'GET',
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get Single League by league id',
            tags: ['League'],
            summary: 'Get League',
            params: {
                id: { type: 'number' },
            },
            response: {
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.ILeagueResponseBody,
                        },
                    },
                },
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.ILeagueResponseBody,
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        preHandler: Auth_1.isAuthorized,
        handler: async (req, res) => await new LeagueController_1.default(fastify, req, res).getleague(),
    });
};
exports.default = leaguesQueries;
//# sourceMappingURL=index.js.map