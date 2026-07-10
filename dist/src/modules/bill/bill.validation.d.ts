import * as zod from "zod";
export declare class BillValidation {
    static readonly GENERATE: zod.ZodObject<{
        body: zod.ZodObject<{
            feeTypeId: zod.ZodString;
            periodMonth: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
            periodYear: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
            dueDate: zod.z.ZodCoercedDate<unknown>;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly LIST_QUERY: zod.ZodObject<{
        query: zod.ZodObject<{
            page: zod.ZodDefault<zod.z.ZodCoercedNumber<unknown>>;
            limit: zod.ZodDefault<zod.z.ZodCoercedNumber<unknown>>;
            status: zod.ZodOptional<zod.ZodEnum<{
                unpaid: "unpaid";
                pending: "pending";
                paid: "paid";
                overdue: "overdue";
                cancelled: "cancelled";
            }>>;
            feeTypeId: zod.ZodOptional<zod.ZodString>;
            batchId: zod.ZodOptional<zod.ZodString>;
            periodMonth: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
            periodYear: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly DETAIL: zod.ZodObject<{
        params: zod.ZodObject<{
            id: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly CANCEL_BATCH: zod.ZodObject<{
        body: zod.ZodObject<{
            batchId: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly MY_BILL_DETAIL: zod.ZodObject<{
        params: zod.ZodObject<{
            id: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
}
export type GenerateBillInput = zod.infer<typeof BillValidation.GENERATE>;
export type BillListQueryInput = zod.infer<typeof BillValidation.LIST_QUERY>;
export type BillDetailInput = zod.infer<typeof BillValidation.DETAIL>;
export type CancelBatchBillInput = zod.infer<typeof BillValidation.CANCEL_BATCH>;
export type MyBillDetailInput = zod.infer<typeof BillValidation.MY_BILL_DETAIL>;
export type BillPayload = {
    id: string;
    role: string;
};
//# sourceMappingURL=bill.validation.d.ts.map