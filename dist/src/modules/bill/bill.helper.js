"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBillCode = makeBillCode;
exports.makeBillBatchId = makeBillBatchId;
function makeBillCode(params) {
    const period = params.periodYear && params.periodMonth
        ? `${params.periodYear}${String(params.periodMonth).padStart(2, "0")}`
        : "ONCE";
    const fee = params.feeTypeId.slice(0, 4).toUpperCase();
    const billNumberText = String(params.billNumber).padStart(4, "0");
    const randomNumber = Math.random().toString(16).slice(2, 6).toUpperCase();
    const billCode = `BILL-${period}-${fee}-${billNumberText}-${randomNumber}`;
    return billCode;
}
function makeBillBatchId(params) {
    const period = params.periodYear && params.periodMonth
        ? `${params.periodYear}${String(params.periodMonth).padStart(2, "0")}`
        : "ONCE";
    const fee = params.feeTypeId.slice(0, 4).toUpperCase();
    const randomNumber = Math.random().toString(16).slice(2, 8).toUpperCase();
    const batchId = `BATCH-${period}-${fee}-${randomNumber}`;
    return batchId;
}
//# sourceMappingURL=bill.helper.js.map