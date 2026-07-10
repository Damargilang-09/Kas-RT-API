"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODEMAILER_GOOGLE_APP_USER_EMAIL = exports.NODEMAILER_GOOGLE_APP_PASSWORD = exports.JWT_EXPIRES_IN = exports.JWT_SECRET_KEY = exports.DIRECT_URL = exports.DATABASE_URL = exports.WHITE_LIST = exports.API_PREFIX = exports.PORT = void 0;
require("dotenv/config");
exports.PORT = parseInt(process.env.PORT) || 8000;
exports.API_PREFIX = process.env.API_PREFIX || "/api";
exports.WHITE_LIST = ((_a = process.env.WHITE_LIST) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.DIRECT_URL = process.env.DIRECT_URL;
exports.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
exports.NODEMAILER_GOOGLE_APP_PASSWORD = process.env.NODEMAILER_GOOGLE_APP_PASSWORD;
exports.NODEMAILER_GOOGLE_APP_USER_EMAIL = process.env.NODEMAILER_GOOGLE_APP_USER_EMAIL;
// export const REDIS_DB = process.env.REDIS_DB;
// export const REDIS_HOST = process.env.REDIS_HOST;
// export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
// export const REDIS_PORT = process.env.REDIS_PORT;
//# sourceMappingURL=env.config.js.map