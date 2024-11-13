"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    app;
    body;
    req;
    res;
    user;
    constructor(app, req, res) {
        this.app = app;
        this.body = req.body;
        this.req = req;
        this.res = res;
        this.user = req.user;
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map