"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billSelect = void 0;
exports.billSelect = {
    id: true,
    feeTypeId: true,
    userId: true,
    billCode: true,
    batchId: true,
    amount: true,
    periodYear: true,
    periodMonth: true,
    dueDate: true,
    status: true,
    paidAt: true,
    createdAt: true,
    updatedAt: true,
    feeType: { select: { id: true, name: true, billingPeriod: true } },
    user: { select: { id: true, name: true, email: true, houseNumber: true } },
};
//# sourceMappingURL=bill.select.js.map