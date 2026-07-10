"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const response_error_util_1 = require("../../utils/response-error.util");
const http_status_codes_1 = require("http-status-codes");
const jwt_util_1 = require("../../utils/jwt.util");
class AuthMiddleware {
    static authenticated(req, res, next) {
        var _a;
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        console.log("Token from COOKIE:", token);
        if (!token) {
            throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Format token salah atau token tidak ditemukan");
        }
        const payload = jwt_util_1.JWTUtil.verifyToken(token);
        console.log("JWT PAYLOAD:", payload);
        res.locals.payload = payload;
        next();
    }
    static authorized(allowedRoles) {
        return (req, res, next) => {
            const payload = res.locals.payload;
            console.log("ALLOWED ROLES:", allowedRoles);
            console.log("USER ROLE:", payload === null || payload === void 0 ? void 0 : payload.role);
            if (!payload.role || !allowedRoles.includes(payload.role)) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.FORBIDDEN, "User tidak memiliki akses!");
            }
            next();
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map