"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../configs/env.config");
const response_error_util_1 = require("./response-error.util");
const http_status_codes_1 = require("http-status-codes");
class JWTUtil {
    static signToken(payload) {
        if (!env_config_1.JWT_SECRET_KEY) {
            throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "JWT_SECRET_KEY is not configured");
        }
        return jsonwebtoken_1.default.sign(Object.assign({}, payload), env_config_1.JWT_SECRET_KEY, {
            expiresIn: env_config_1.JWT_EXPIRES_IN,
        });
    }
    static verifyToken(token, secretKey = env_config_1.JWT_SECRET_KEY) {
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
}
exports.JWTUtil = JWTUtil;
//# sourceMappingURL=jwt.util.js.map