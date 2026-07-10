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
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const http_status_codes_1 = require("http-status-codes");
const validation_1 = require("../../validations/validation");
const user_validation_1 = require("./user.validation");
const response_error_util_1 = require("../../utils/response-error.util");
class UserController {
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("USER CONTROLLER : GET_USER [REQUEST MASUK]");
            console.log("Query :", req.query);
            console.log("Payload:", res.locals.payload);
            const { query } = (0, validation_1.validate)(user_validation_1.UserValidation.LIST_QUERY, { query: req.query });
            console.log("[USER_CONTROLLER][GET_USERS] Query setelah validasi:", query);
            const result = yield user_service_1.UserService.getUsers({ query });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "List data users berhasil diterima!",
                data: result,
            });
        });
    }
    static getUserDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("USER CONTROLLER : GET_USER_DETAIL [REQUEST MASUK]");
            console.log("PARAMS :", req.params);
            const { params } = (0, validation_1.validate)(user_validation_1.UserValidation.DETAIL, { params: req.params });
            console.log("[USER_CONTROLLER][GET_USER_DETAIL] Params setelah validasi:", params);
            const user = yield user_service_1.UserService.getUserDetail({ params });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Detail User berhasil diterima!",
                data: user,
            });
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("USER CONTROLLER : UPDATE_USER [REQUEST MASUK]");
            console.log("PARAMS :", req.params);
            console.log("BODY :", req.body);
            console.log("Payload:", res.locals.payload);
            const { params, body } = (0, validation_1.validate)(user_validation_1.UserValidation.UPDATE, {
                params: req.params,
                body: req.body,
            });
            console.log("[USER_CONTROLLER][UPDATE_USER] Params setelah validasi:", params);
            console.log("[USER_CONTROLLER][UPDATE_USER]Body setelah validasi:", body);
            const payloadCheck = res.locals.payload;
            if (payloadCheck.id === params.id) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Tidak boleh mengubah status atau role sendiri!");
            }
            const updateUser = yield user_service_1.UserService.updateUser({ params, body });
            console.log("STATUS SETELAH SERVICE:", updateUser.status);
            console.log("ROLE SETELAH SERVICE:", updateUser.role);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "User berhasil di-update!",
                data: updateUser,
            });
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map