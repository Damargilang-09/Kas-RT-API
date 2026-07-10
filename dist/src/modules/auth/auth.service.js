"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_client_config_1 = require("../../configs/prisma-client.config");
const response_error_util_1 = require("../../utils/response-error.util");
const bycrpt_util_1 = require("../../utils/bycrpt.util");
const prisma_1 = require("../../../generated/prisma");
const jwt_util_1 = require("../../utils/jwt.util");
const mail_service_1 = require("../mail/mail.service");
class AuthService {
    // TODO: known issue - user yang di-softdelete tidak bisa register ulang
    // dengan email yang sama karena unique constraint. Belum di-handle karena scope project terbatas.
    static register(_a) {
        return __awaiter(this, arguments, void 0, function* ({ body }) {
            const existingEmail = yield prisma_client_config_1.prisma.user.findUnique({
                where: { email: body.email },
            });
            if (existingEmail) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.CONFLICT, "Email sudah terdaftar!");
            }
            const existingHouse = yield prisma_client_config_1.prisma.user.findUnique({
                where: { houseNumber: body.houseNumber },
            });
            if (existingHouse) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.CONFLICT, "Nomor Blok Rumah sudah terdaftar!");
            }
            const passwordHashed = yield bycrpt_util_1.BcryptUtil.hash(body.password);
            const safeUser = yield prisma_client_config_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const user = yield tx.user.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        passwordHash: passwordHashed,
                        role: prisma_1.UserRole.warga,
                        houseNumber: body.houseNumber,
                        address: body.address,
                        status: prisma_1.UserStatus.inactive,
                    },
                });
                yield mail_service_1.MailService.sendRegisterWaitingActivation({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { passwordHash } = user, userNoPassword = __rest(user, ["passwordHash"]);
                return userNoPassword;
            }));
            return safeUser;
        });
    }
    static login(_a) {
        return __awaiter(this, arguments, void 0, function* ({ body }) {
            const existingUser = yield prisma_client_config_1.prisma.user.findUnique({
                where: { email: body.email },
            });
            if (!existingUser) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Email atau Password Salah!");
            }
            if (existingUser.deleted_at) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.FORBIDDEN, "Akun anda sudah tidak aktif");
            }
            const isValid = yield bycrpt_util_1.BcryptUtil.compare(body.password, existingUser.passwordHash);
            if (!isValid) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Email atau Password Salah!");
            }
            if (existingUser.status !== prisma_1.UserStatus.active) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.FORBIDDEN, "Akun Anda belum aktif. Silahkan tunggu aktivasi dari Ketua RT");
            }
            const token = jwt_util_1.JWTUtil.signToken({
                id: existingUser.id,
                role: existingUser.role,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordHash } = existingUser, safeUser = __rest(existingUser, ["passwordHash"]);
            return { safeUser, token };
        });
    }
    static getMe(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_client_config_1.prisma.user.findFirst({
                where: {
                    id: userId,
                    deleted_at: null,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    houseNumber: true,
                    address: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "User tidak ditemukan");
            }
            return user;
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map