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
exports.BillController = void 0;
const validation_1 = require("../../validations/validation");
const bill_validation_1 = require("./bill.validation");
const bill_service_1 = require("./bill.service");
const http_status_codes_1 = require("http-status-codes");
class BillController {
    static generateBills(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = (0, validation_1.validate)(bill_validation_1.BillValidation.GENERATE, {
                body: req.body,
            });
            const payload = res.locals.payload;
            const result = yield bill_service_1.BillService.generateBill({
                body,
                payload,
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                success: true,
                message: "Tagihan Iuran Batch Berhasil Dibuat!",
                data: result,
            });
        });
    }
    static getBills(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query } = (0, validation_1.validate)(bill_validation_1.BillValidation.LIST_QUERY, {
                query: req.query,
            });
            const { bills, meta } = yield bill_service_1.BillService.getBills({
                query,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "List Tagihan Iuran Berhasil Didapat!",
                data: bills,
                meta,
            });
        });
    }
    static getBillDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params } = (0, validation_1.validate)(bill_validation_1.BillValidation.DETAIL, {
                params: req.params,
            });
            const result = yield bill_service_1.BillService.getBillDetail({
                params,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Detail Tagihan Iuran Berhasil Didapat!",
                data: result,
            });
        });
    }
    static cancelBillBatch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = (0, validation_1.validate)(bill_validation_1.BillValidation.CANCEL_BATCH, {
                body: req.body,
            });
            const payload = res.locals.payload;
            const result = yield bill_service_1.BillService.cancelBillBatch({
                body,
                payload,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Batch Tagihan Berhasil Dibatalkan!",
                data: result,
            });
        });
    }
    static getMyBills(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payload = (_a = res.locals) === null || _a === void 0 ? void 0 : _a.payload;
            const getMyBills = yield bill_service_1.BillService.getMyBills(payload);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "List Tagihan Berhasil Diterima",
                data: getMyBills,
            });
        });
    }
    static getMyBillDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { params } = (0, validation_1.validate)(bill_validation_1.BillValidation.MY_BILL_DETAIL, {
                params: req.params,
            });
            const payload = (_a = res.locals) === null || _a === void 0 ? void 0 : _a.payload;
            const myBillDetail = yield bill_service_1.BillService.getMyBillDetail({ params, payload });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "Detail Tagihan Saya Berhasil Diterima",
                data: myBillDetail,
            });
        });
    }
}
exports.BillController = BillController;
//# sourceMappingURL=bill.controller.js.map