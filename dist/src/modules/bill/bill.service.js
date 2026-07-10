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
exports.BillService = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_client_config_1 = require("../../configs/prisma-client.config");
const response_error_util_1 = require("../../utils/response-error.util");
const prisma_1 = require("../../../generated/prisma");
const bill_helper_1 = require("./bill.helper");
const bill_select_1 = require("./bill.select");
const mail_service_1 = require("../mail/mail.service");
class BillService {
    // Function GenerateBILL
    static generateBill(_a) {
        return __awaiter(this, arguments, void 0, function* ({ body, payload, }) {
            var _b, _c;
            const feeType = yield prisma_client_config_1.prisma.feeType.findFirst({
                where: {
                    id: body.feeTypeId,
                    deleted_at: null,
                },
            });
            if (!feeType) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Jenis Tagihan Tidak Ditemukan");
            }
            if (feeType.billingPeriod === prisma_1.BillingPeriod.monthly &&
                (!body.periodMonth || !body.periodYear)) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Bulan dan Tahun Periode Wajib untuk Iuran Bulanan");
            }
            const periodMonth = feeType.billingPeriod === prisma_1.BillingPeriod.once
                ? null
                : ((_b = body.periodMonth) !== null && _b !== void 0 ? _b : null);
            const periodYear = feeType.billingPeriod === prisma_1.BillingPeriod.once
                ? null
                : ((_c = body.periodYear) !== null && _c !== void 0 ? _c : null);
            const batchId = (0, bill_helper_1.makeBillBatchId)({
                periodYear,
                periodMonth,
                feeTypeId: feeType.id,
            });
            const targetUsers = yield prisma_client_config_1.prisma.user.findMany({
                where: {
                    status: prisma_1.UserStatus.active,
                    deleted_at: null,
                    role: {
                        in: [prisma_1.UserRole.warga, prisma_1.UserRole.bendahara, prisma_1.UserRole.ketuaRT],
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });
            const createdItems = yield prisma_client_config_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const results = [];
                let billNumber = 1;
                let skippedDuplicateCount = 0;
                for (const user of targetUsers) {
                    const existingBill = yield tx.bill.findFirst({
                        where: {
                            feeTypeId: feeType.id,
                            userId: user.id,
                            periodMonth,
                            periodYear,
                            deleted_at: null,
                        },
                    });
                    if (existingBill) {
                        skippedDuplicateCount += 1;
                        continue;
                    }
                    const billCode = (0, bill_helper_1.makeBillCode)({
                        periodYear,
                        periodMonth,
                        feeTypeId: feeType.id,
                        billNumber,
                    });
                    const bill = yield tx.bill.create({
                        data: {
                            feeTypeId: feeType.id,
                            userId: user.id,
                            billCode,
                            batchId,
                            amount: feeType.amount,
                            periodMonth,
                            periodYear,
                            dueDate: body.dueDate,
                            status: prisma_1.BillStatus.unpaid,
                        },
                        select: bill_select_1.billSelect,
                    });
                    const mailContent = mail_service_1.MailService.buildBillContent({
                        name: user.name,
                        billCode: bill.billCode,
                        feeTypeName: bill.feeType.name,
                        amount: String(bill.amount),
                        dueDate: bill.dueDate,
                    });
                    const mailerLog = yield tx.mailerLog.create({
                        data: {
                            userId: user.id,
                            emailTo: user.email,
                            subject: mailContent.subject,
                            body: mailContent.htmlTemplate,
                            type: prisma_1.MailerLogType.bill_created,
                            referenceType: prisma_1.MailerReferenceType.bill,
                            referenceId: bill.id,
                            status: prisma_1.MailerStatus.pending,
                        },
                        select: {
                            id: true,
                            emailTo: true,
                            subject: true,
                            body: true,
                        },
                    });
                    results.push({ bill, mailerLog });
                    billNumber += 1;
                }
                const result = {
                    items: results,
                    skippedDuplicateCount,
                };
                return result;
            }));
            const bills = createdItems.items.map((item) => item.bill);
            const auditLog = yield prisma_client_config_1.prisma.auditLog.create({
                data: {
                    userId: payload.id,
                    action: "generate_bills",
                    tableName: "bills",
                    recordId: null,
                    newValue: {
                        batchId,
                        feeTypeId: feeType.id,
                        feeTypeName: feeType.name,
                        billingPeriod: feeType.billingPeriod,
                        periodMonth,
                        periodYear,
                        dueDate: body.dueDate.toISOString(),
                        targetUserCount: targetUsers.length,
                        createdBillCount: bills.length,
                        skippedDuplicateCount: createdItems.skippedDuplicateCount,
                        createdBillIds: bills.map((bill) => bill.id),
                    },
                },
            });
            for (const item of createdItems.items) {
                yield mail_service_1.MailService.sendBillFromLog({
                    mailerLogId: item.mailerLog.id,
                    to: item.mailerLog.emailTo,
                    subject: item.mailerLog.subject,
                    html: item.mailerLog.body,
                });
            }
            const result = {
                batchId,
                bills,
                auditLogId: auditLog.id,
            };
            return result;
        });
    }
    // Function GetBills
    static getBills(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query }) {
            const skip = (query.page - 1) * query.limit;
            const take = query.limit;
            const where = {
                deleted_at: null,
            };
            if (query.status) {
                where.status = query.status;
            }
            if (query.feeTypeId) {
                where.feeTypeId = query.feeTypeId;
            }
            if (query.batchId) {
                where.batchId = query.batchId;
            }
            if (query.periodMonth) {
                where.periodMonth = query.periodMonth;
            }
            if (query.periodYear) {
                where.periodYear = query.periodYear;
            }
            const bills = yield prisma_client_config_1.prisma.bill.findMany({
                where,
                skip,
                take,
                select: bill_select_1.billSelect,
                orderBy: {
                    createdAt: "desc",
                },
            });
            const totalData = yield prisma_client_config_1.prisma.bill.count({
                where,
            });
            const totalPage = Math.ceil(totalData / take);
            const result = {
                bills,
                meta: {
                    page: query.page,
                    limit: take,
                    totalData,
                    totalPage,
                },
            };
            return result;
        });
    }
    // Function ini untuk ambil detail tagihan.
    static getBillDetail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params }) {
            const bill = yield prisma_client_config_1.prisma.bill.findFirst({
                where: {
                    id: params.id,
                    deleted_at: null,
                },
                select: bill_select_1.billSelect,
            });
            if (!bill) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Tagihan Tidak Ditemukan");
            }
            return bill;
        });
    }
    // Function untuk cancel Bill Batch
    static cancelBillBatch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ body, payload, }) {
            const billsInBatch = yield prisma_client_config_1.prisma.bill.findMany({
                where: {
                    batchId: body.batchId,
                    deleted_at: null,
                },
                select: {
                    id: true,
                    billCode: true,
                    batchId: true,
                    userId: true,
                    status: true,
                    feeTypeId: true,
                    periodMonth: true,
                    periodYear: true,
                },
            });
            if (billsInBatch.length === 0) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Batch Tagihan Tidak Ditemukan");
            }
            const cancellableStatuses = [
                prisma_1.BillStatus.unpaid,
                prisma_1.BillStatus.overdue,
            ];
            const cancellableBills = billsInBatch.filter((bill) => cancellableStatuses.includes(bill.status));
            const paidBills = billsInBatch.filter((bill) => bill.status === prisma_1.BillStatus.paid);
            const pendingBills = billsInBatch.filter((bill) => bill.status === prisma_1.BillStatus.pending);
            const alreadyCancelledBills = billsInBatch.filter((bill) => bill.status === prisma_1.BillStatus.cancelled);
            if (cancellableBills.length === 0) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Tidak ada tagihan yang bisa dibatalkan. Semua tagihan sudah paid, pending, atau cancelled.");
            }
            const cancelledBills = yield prisma_client_config_1.prisma.bill.updateMany({
                where: {
                    id: {
                        in: cancellableBills.map((bill) => bill.id),
                    },
                },
                data: {
                    status: prisma_1.BillStatus.cancelled,
                },
            });
            const result = {
                batchId: body.batchId,
                totalBillInBatch: billsInBatch.length,
                cancelledCount: cancelledBills.count,
                paidSkippedCount: paidBills.length,
                pendingSkippedCount: pendingBills.length,
                alreadyCancelledCount: alreadyCancelledBills.length,
                cancelledBillIds: cancellableBills.map((bill) => bill.id),
                paidSkippedBillIds: paidBills.map((bill) => bill.id),
                pendingSkippedBillIds: pendingBills.map((bill) => bill.id),
                alreadyCancelledBillIds: alreadyCancelledBills.map((bill) => bill.id),
            };
            const auditLog = yield prisma_client_config_1.prisma.auditLog.create({
                data: {
                    userId: payload.id,
                    action: "cancel_batch_bills",
                    tableName: "bills",
                    recordId: null,
                    newValue: result,
                },
            });
            const response = Object.assign(Object.assign({}, result), { auditLogId: auditLog.id });
            return response;
        });
    }
    // Function untuk lihat my-bills
    static getMyBills(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const getMyBills = yield prisma_client_config_1.prisma.bill.findMany({
                where: {
                    userId: payload.id,
                    deleted_at: null,
                    status: {
                        in: [prisma_1.BillStatus.pending, prisma_1.BillStatus.unpaid, prisma_1.BillStatus.overdue],
                    },
                },
                select: bill_select_1.billSelect,
                orderBy: { dueDate: "asc" },
            });
            return getMyBills;
        });
    }
    static getMyBillDetail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params, payload, }) {
            const myBillDetail = yield prisma_client_config_1.prisma.bill.findFirst({
                where: { id: params.id, userId: payload.id, deleted_at: null },
                select: bill_select_1.billSelect,
            });
            if (!myBillDetail) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Bill Tagihan Tidak Ditemukan");
            }
            return myBillDetail;
        });
    }
}
exports.BillService = BillService;
//# sourceMappingURL=bill.service.js.map