"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const ErrorMiddleware = (err, _, res, __) => {
    var _a;
    console.error(err);
    const statusCode = (_a = err === null || err === void 0 ? void 0 : err.statusCode) !== null && _a !== void 0 ? _a : http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    const message = (err === null || err === void 0 ? void 0 : err.isExpose) ? err.message : "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message,
        data: null,
    });
};
exports.ErrorMiddleware = ErrorMiddleware;
//# sourceMappingURL=error.middleware.js.map