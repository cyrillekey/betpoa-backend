"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FixturesController_1 = __importDefault(require("@controllers/FixturesController"));
const response_1 = require("@controllers/interface/response");
const fixturesQueries = async (fastify, _opts) => {
    fastify.get('/', {
        schema: {
            summary: 'Get all fixtures',
            tags: ['Fixture'],
            description: 'Get all fixtures',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                properties: response_1.FixtureResponse,
                            },
                        },
                    },
                },
                default: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                properties: response_1.FixtureResponse,
                            },
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
            querystring: {
                fromDate: { type: 'string' },
                toDate: { type: 'string' },
                pageSize: { type: 'number' },
                page: { type: 'number' },
                leagueIds: { type: 'string', description: 'League ids separated by dash. E.g 1-2-3-4' },
                country: { type: 'string' },
                teamsId: { type: 'string', description: 'Team ids separated by dash. E.g 1-2-3-4' },
                status: { type: 'string', enum: ['FINISHED', 'UPCOMMING', 'ABANDONED', 'INPLAY', 'CANCELLED'] },
            },
        },
    }, async (request, reply) => {
        return await new FixturesController_1.default(fastify, request, reply).getAllFixtures();
    });
    fastify.get('/betting', {
        schema: {
            summary: 'Get all fixtures for betting',
            tags: ['Fixture'],
            description: 'Betting Fixtures',
            response: {
                default: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                properties: response_1.FixtureResponse,
                            },
                        },
                    },
                },
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                properties: response_1.FixtureResponse,
                            },
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
            querystring: {
                fromDate: { type: 'string' },
                toDate: { type: 'string' },
                pageSize: { type: 'number' },
                page: { type: 'number' },
                leagueIds: { type: 'string', description: 'League ids separated by dash. E.g 1-2-3-4' },
                country: { type: 'string' },
                teamsId: { type: 'string', description: 'Team ids separated by dash. E.g 1-2-3-4' },
                status: { type: 'string', enum: ['FINISHED', 'UPCOMMING', 'ABANDONED', 'INPLAY', 'CANCELLED'] },
            },
        },
    }, async (request, reply) => {
        return await new FixturesController_1.default(fastify, request, reply).getAllBettingFixtures();
    });
    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: (req, res) => new FixturesController_1.default(fastify, req, res).getFixtureById(),
        schema: {
            summary: 'Get fixture by Id',
            tags: ['Fixture'],
            description: 'Get Fixture by fixture id as well as teams,leagues and all associated odds',
            params: {
                id: { type: 'number' },
            },
            response: {
                default: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.FixtureResponse,
                        },
                    },
                },
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.FixtureResponse,
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
    });
    fastify.route({
        method: 'GET',
        url: '/result/:id',
        schema: {
            tags: ['Fixture'],
            summary: 'Get fixture results',
            description: 'Get Fixture results by fixtureId',
            params: {
                id: { type: 'number', description: 'Fixture id' },
            },
            response: {
                default: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.IFixtureResults,
                        },
                    },
                },
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.IFixtureResults,
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new FixturesController_1.default(fastify, req, res).getFixtureResultByFixtureId(),
    });
    fastify.route({
        method: 'GET',
        url: '/odds/:id',
        schema: {
            tags: ['Fixture'],
            security: [{ bearerAuth: [] }],
            summary: 'Get fixture odds',
            description: 'Get odds for a specific fixture by fixture id',
            params: {
                id: { type: 'number', description: 'fixture id' },
            },
            response: {
                default: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: { properties: response_1.IOdds },
                        },
                    },
                },
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: { properties: response_1.IOdds },
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new FixturesController_1.default(fastify, req, res).getFixtureoddsById(),
    });
    fastify.route({
        method: 'GET',
        url: '/featured',
        schema: {
            tags: ['Fixture'],
            summary: 'Featured Match',
            description: 'Get a featured match with odds from a featured league that is upcoming',
            response: {
                default: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.FixtureResponse,
                        },
                    },
                },
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: response_1.FixtureResponse,
                        },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new FixturesController_1.default(fastify, req, res).getFeaturedMatch(),
    });
};
exports.default = fixturesQueries;
//# sourceMappingURL=index.js.map