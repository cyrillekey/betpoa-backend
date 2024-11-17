"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.app = void 0;
require("module-alias/register");
const autoload_1 = __importDefault(require("@fastify/autoload"));
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const fastify_sentry_1 = __importDefault(require("@immobiliarelabs/fastify-sentry"));
const profiling_node_1 = require("@sentry/profiling-node");
const path_1 = require("path");
const configs_1 = require("./configs");
const options = {};
exports.options = options;
const app = async (fastify, opts) => {
    fastify.withTypeProvider();
    fastify.register(fastify_sentry_1.default, {
        dsn: 'https://921097d6a76bab89051f3a2d7433fa20@o4507057833902080.ingest.us.sentry.io/4507057837506560',
        integrations: [(0, profiling_node_1.nodeProfilingIntegration)()],
        enabled: process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging',
        tracesSampleRate: 0.3,
        enableTracing: true,
        release: '1.0.0',
    });
    fastify.register(cors_1.default, {
        origin: true,
    });
    fastify.register(swagger_1.default, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Betpoa Documentation',
                description: 'Betpoa Betting Rest Api Documentation',
                version: '1.0.0',
                contact: { email: 'cyrilleotieno7@gmail.com' },
                summary: 'Betpoa backend rest api',
            },
            tags: [
                {
                    name: 'Auth',
                    description: 'Betpoa authentication methods covering signup to password reset',
                },
                {
                    name: 'User',
                    description: 'Betpoa methods that interact with the user object',
                },
                {
                    name: 'League',
                    description: 'Betpoa leagues for for different seasons and competitions which fixtures and odds are available',
                },
                {
                    name: 'Fixture',
                    description: 'Betpoa match fixtures for past and upcoming fixtures as well as fixture results and fixture odds.\n All fixtures and odds are updated everyday at midnight and future fixtures are available upto 3 days',
                },
                {
                    name: 'Admin',
                    description: `Administrative endpoints for managing the system,users,bets and all administrative task associated with ${configs_1.configs.appname}`,
                },
            ],
            servers: [
                {
                    url: configs_1.configs.apiurl,
                    description: 'Production server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });
    void fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'plugins'),
        options: opts,
    });
    void fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'routes'),
        options: opts,
    });
};
exports.app = app;
exports.default = app;
//# sourceMappingURL=app.js.map