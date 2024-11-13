"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@configs/index");
const Auth_1 = require("@hooks/Auth");
const adminRoute = async (fastify) => {
    fastify.get('/users', {
        preHandler: Auth_1.isAdmin,
        schema: {
            summary: 'Users',
            description: `Get app ${index_1.configs.appname} users and user status`,
            security: [{ bearerAuth: [] }],
            tags: ['Admin'],
        },
    }, (_req, _res) => { });
    fastify.post('/user/:id', {
        preHandler: Auth_1.isAdmin,
        schema: {
            summary: 'Get user',
            security: [{ bearerAuth: [] }],
            tags: ['Admin'],
            description: `Get single ${index_1.configs.appname} user`,
        },
    }, (_req, _res) => { });
    fastify.put('/user/:id', {}, (_req, _res) => { });
    fastify.delete('/user/:id', {}, (_req, _res) => { });
};
exports.default = adminRoute;
//# sourceMappingURL=index.js.map