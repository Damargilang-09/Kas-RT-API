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
exports.FeeController = void 0;
const fee_service_1 = require("./fee.service");
const http_status_codes_1 = require("http-status-codes");
const validation_1 = require("../../validations/validation");
const fee_validation_1 = require("./fee.validation");
class FeeController {
    static getFeeTypes(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const feeTypeList = yield fee_service_1.FeeService.getFeeTypes();
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Data Jenis Tagihan Berhasil Diterima!",
                data: feeTypeList,
            });
        });
    }
    static createFeetype(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = (0, validation_1.validate)(fee_validation_1.FeeValidation.CREATE, { body: req.body });
            const payload = res.locals.payload;
            const feeType = yield fee_service_1.FeeService.createFeeType({ body }, payload);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Jenis Tagihan Berhasil Dibuat!",
                data: feeType,
            });
        });
    }
    static getFeeTypeDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params } = (0, validation_1.validate)(fee_validation_1.FeeValidation.DETAIL, { params: req.params });
            const feeTypeDetail = yield fee_service_1.FeeService.getFeeTypeDetail({ params });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Detail Jenis Tagihan Berhasil Diterima",
                data: feeTypeDetail,
            });
        });
    }
    static updateFeeType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, body } = (0, validation_1.validate)(fee_validation_1.FeeValidation.UPDATE, {
                params: req.params,
                body: req.body,
            });
            const payload = res.locals.payload;
            const result = yield fee_service_1.FeeService.updateFeeType({ params, body, payload });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Jenis Tagihan Berhasil Diupdate!",
                data: result,
            });
        });
    }
    static deleteFeeType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params } = (0, validation_1.validate)(fee_validation_1.FeeValidation.DELETE, { params: req.params });
            const deletedFeeType = yield fee_service_1.FeeService.deleteFeeType({ params });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Jenis Tagihan Berhasil Dihapus",
                data: deletedFeeType,
            });
        });
    }
}
exports.FeeController = FeeController;
//# sourceMappingURL=fee.controller.js.map