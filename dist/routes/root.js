"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@configs/index");
const root = async (fastify, _opts) => {
    fastify.get('/', { schema: { hide: true } }, async function (_request, _reply) {
        return { root: true, status: `${index_1.configs.appname} server is healthy` };
    });
};
exports.default = root;
//# sourceMappingURL=root.js.map