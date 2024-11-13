"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MpesaController_1 = __importDefault(require("@controllers/MpesaController"));
const callbackRoutes = async (fastity, _opts) => {
    fastity.route({
        method: 'POST',
        url: '/mobile/deposit',
        schema: {
            hide: true,
        },
        handler: async (req, res) => await new MpesaController_1.default(fastity, req, res).handleMpesaDepositCallback(),
    });
};
exports.default = callbackRoutes;
//# sourceMappingURL=index.js.map