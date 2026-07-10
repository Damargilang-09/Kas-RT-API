"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_config_1 = require("./env.config");
// console.log("EMAIL_USER:", NODEMAILER_GOOGLE_APP_USER_EMAIL);
// console.log("EMAIL_PASS length:", NODEMAILER_GOOGLE_APP_PASSWORD?.length);
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: env_config_1.NODEMAILER_GOOGLE_APP_USER_EMAIL,
        pass: env_config_1.NODEMAILER_GOOGLE_APP_PASSWORD,
    },
});
exports.default = transporter;
//# sourceMappingURL=nodemailer.config.js.map