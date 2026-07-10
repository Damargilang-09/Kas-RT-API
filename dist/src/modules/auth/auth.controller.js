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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const validation_1 = require("../../validations/validation");
const auth_validation_1 = require("./auth.validation");
const auth_service_1 = require("./auth.service");
const http_status_codes_1 = require("http-status-codes");
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("USER REGISTER REQUEST:", {
                method: req.method,
                url: req.originalUrl,
                body: {
                    email: req.body.email,
                    password: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.password)
                        ? "Password Diterima"
                        : "Password Tidak Ditemukan",
                },
            });
            const { body } = (0, validation_1.validate)(auth_validation_1.AuthValidation.REGISTER_USER, { body: req.body });
            const safeUser = yield auth_service_1.AuthService.register({ body });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                success: true,
                message: "User berhasil didaftarkan!",
                data: safeUser,
            });
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("USER LOGIN REQUEST:", {
                method: req.method,
                url: req.originalUrl,
                body: {
                    email: req.body.email,
                    password: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.password)
                        ? "Password Diterima"
                        : "Password Tidak Ditemukan",
                },
            });
            const { body } = (0, validation_1.validate)(auth_validation_1.AuthValidation.LOGIN_USER, { body: req.body });
            const { safeUser, token } = yield auth_service_1.AuthService.login({ body });
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                // secure:true, jangan lupa diganti kalo udah production
                sameSite: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Login user berhasil!",
                data: safeUser,
            });
        });
    }
    static getMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = res.locals.payload;
            const getMe = yield auth_service_1.AuthService.getMe(payload.id);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Berhasil mengambil data user login!",
                data: getMe,
            });
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("token", {
                httpOnly: true,
                // secure:true, jangan lupa diganti kalo udah production
                secure: false,
                sameSite: true,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Logout user berhasil!",
                data: null,
            });
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map