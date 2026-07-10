export declare const billSelect: {
    id: boolean;
    feeTypeId: boolean;
    userId: boolean;
    billCode: boolean;
    batchId: boolean;
    amount: boolean;
    periodYear: boolean;
    periodMonth: boolean;
    dueDate: boolean;
    status: boolean;
    paidAt: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    feeType: {
        select: {
            id: boolean;
            name: boolean;
            billingPeriod: boolean;
        };
    };
    user: {
        select: {
            id: boolean;
            name: boolean;
            email: boolean;
            houseNumber: boolean;
        };
    };
};
//# sourceMappingURL=bill.select.d.ts.map