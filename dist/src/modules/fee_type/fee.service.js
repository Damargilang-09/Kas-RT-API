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
exports.FeeService = void 0;
const prisma_client_config_1 = require("../../configs/prisma-client.config");
const fee_select_1 = require("./fee.select");
const response_error_util_1 = require("../../utils/response-error.util");
const http_status_codes_1 = require("http-status-codes");
class FeeService {
    static getFeeTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const feeTypes = yield prisma_client_config_1.prisma.feeType.findMany({
                where: { deleted_at: null },
                select: fee_select_1.FeeTypeSelect,
                orderBy: { name: "asc" },
            });
            return feeTypes;
        });
    }
    static createFeeType(_a, payload_1) {
        return __awaiter(this, arguments, void 0, function* ({ body }, payload) {
            var _b, _c;
            const existingFeeType = yield prisma_client_config_1.prisma.feeType.findFirst({
                where: { name: body.name, deleted_at: null },
            });
            if (existingFeeType) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Nama jenis tagihan sudah ada");
            }
            const feeType = yield prisma_client_config_1.prisma.feeType.create({
                data: {
                    createdById: payload.id,
                    name: body.name,
                    amount: body.amount,
                    description: (_b = body.description) !== null && _b !== void 0 ? _b : null,
                    billingPeriod: body.billingPeriod,
                    dueDay: (_c = body.dueDay) !== null && _c !== void 0 ? _c : null,
                },
                select: fee_select_1.FeeTypeSelect,
            });
            return feeType;
        });
    }
    static getFeeTypeDetail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params }) {
            const feeTypeDetail = yield prisma_client_config_1.prisma.feeType.findFirst({
                where: { id: params.id, deleted_at: null },
                select: fee_select_1.FeeTypeSelect,
            });
            if (!feeTypeDetail) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Jenis tagihan tidak ditemukan");
            }
            return feeTypeDetail;
        });
    }
    static updateFeeType(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params, body, payload, }) {
            const existingFeeType = yield prisma_client_config_1.prisma.feeType.findFirst({
                where: { id: params.id, delete: null },
            });
            if (!existingFeeType) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Jenis Tagihan Tidak Ditemukan");
            }
            if (body.name && body.name !== existingFeeType.name) {
                const duplicateFeeType = yield prisma_client_config_1.prisma.feeType.findFirst({
                    where: { name: body.name, deletedAt: null, NOT: { id: params.id } },
                });
                if (duplicateFeeType) {
                    throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Nama jenis sudah digunakan");
                }
            }
            const result = yield prisma_client_config_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                // versioningnya di sini, jadi ini nambahin deletedAt
                yield tx.feeType.update({
                    where: { id: params.id },
                    data: { deleted_at: new Date() },
                });
                // terus tinggal buat iuran baru.
                const newFeeType = yield tx.feeType.create({
                    data: {
                        createdById: payload.id,
                        name: (_a = body.name) !== null && _a !== void 0 ? _a : existingFeeType.name,
                        amount: (_b = body.amount) !== null && _b !== void 0 ? _b : existingFeeType.amount,
                        description: body.description !== undefined
                            ? body.description
                            : existingFeeType.description,
                        billingPeriod: (_c = body.billingPeriod) !== null && _c !== void 0 ? _c : existingFeeType.billingPeriod,
                        dueDay: body.dueDay !== undefined ? body.dueDay : existingFeeType.dueDay,
                    },
                    select: fee_select_1.FeeTypeSelect,
                });
                return newFeeType;
            }));
            return result;
        });
    }
    static deleteFeeType(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params }) {
            const existingFeeType = yield prisma_client_config_1.prisma.feeType.findFirst({
                where: { id: params.id, deletedAt: null },
            });
            if (!existingFeeType) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Jenis Tagihan Tidak Ditemukan");
            }
            const deletedFeeType = yield prisma_client_config_1.prisma.feeType.update({
                where: { id: params.id },
                data: { deleted_at: new Date() },
                select: fee_select_1.FeeTypeSelect,
            });
            return deletedFeeType;
        });
    }
}
exports.FeeService = FeeService;
//# sourceMappingURL=fee.service.js.map