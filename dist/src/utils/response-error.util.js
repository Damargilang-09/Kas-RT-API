"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseError = void 0;
class ResponseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isExpose = true;
        Object.setPrototypeOf(this, ResponseError.prototype);
    }
}
exports.ResponseError = ResponseError;
//# sourceMappingURL=response-error.util.js.map