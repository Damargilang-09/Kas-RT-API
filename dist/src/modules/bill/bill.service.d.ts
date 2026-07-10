import { Prisma } from "../../../generated/prisma";
import type { BillDetailInput, BillListQueryInput, BillPayload, CancelBatchBillInput, GenerateBillInput, MyBillDetailInput } from "./bill.validation";
export declare class BillService {
    static generateBill({ body, payload, }: GenerateBillInput & {
        payload: BillPayload;
    }): Promise<{
        batchId: string;
        bills: {
            id: string;
            user: {
                name: string;
                email: string;
                houseNumber: string | null;
                id: string;
            };
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma").$Enums.BillStatus;
            userId: string;
            feeType: {
                name: string;
                id: string;
                billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
            };
            amount: Prisma.Decimal;
            periodMonth: number | null;
            periodYear: number | null;
            billCode: string;
            dueDate: Date;
            paidAt: Date | null;
            batchId: string | null;
            feeTypeId: string;
        }[];
        auditLogId: string;
    }>;
    static getBills({ query }: BillListQueryInput): Promise<{
        bills: {
            id: string;
            user: {
                name: string;
                email: string;
                houseNumber: string | null;
                id: string;
            };
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma").$Enums.BillStatus;
            userId: string;
            feeType: {
                name: string;
                id: string;
                billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
            };
            amount: Prisma.Decimal;
            periodMonth: number | null;
            periodYear: number | null;
            billCode: string;
            dueDate: Date;
            paidAt: Date | null;
            batchId: string | null;
            feeTypeId: string;
        }[];
        meta: {
            page: number;
            limit: number;
            totalData: number;
            totalPage: number;
        };
    }>;
    static getBillDetail({ params }: BillDetailInput): Promise<{
        id: string;
        user: {
            name: string;
            email: string;
            houseNumber: string | null;
            id: string;
        };
        createdAt: Date;
        updatedAt: Date;
        status: import("../../../generated/prisma").$Enums.BillStatus;
        userId: string;
        feeType: {
            name: string;
            id: string;
            billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        };
        amount: Prisma.Decimal;
        periodMonth: number | null;
        periodYear: number | null;
        billCode: string;
        dueDate: Date;
        paidAt: Date | null;
        batchId: string | null;
        feeTypeId: string;
    }>;
    static cancelBillBatch({ body, payload, }: CancelBatchBillInput & {
        payload: BillPayload;
    }): Promise<{
        auditLogId: string;
        batchId: string;
        totalBillInBatch: number;
        cancelledCount: number;
        paidSkippedCount: number;
        pendingSkippedCount: number;
        alreadyCancelledCount: number;
        cancelledBillIds: string[];
        paidSkippedBillIds: string[];
        pendingSkippedBillIds: string[];
        alreadyCancelledBillIds: string[];
    }>;
    static getMyBills(payload: BillPayload): Promise<{
        id: string;
        user: {
            name: string;
            email: string;
            houseNumber: string | null;
            id: string;
        };
        createdAt: Date;
        updatedAt: Date;
        status: import("../../../generated/prisma").$Enums.BillStatus;
        userId: string;
        feeType: {
            name: string;
            id: string;
            billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        };
        amount: Prisma.Decimal;
        periodMonth: number | null;
        periodYear: number | null;
        billCode: string;
        dueDate: Date;
        paidAt: Date | null;
        batchId: string | null;
        feeTypeId: string;
    }[]>;
    static getMyBillDetail({ params, payload, }: MyBillDetailInput & {
        payload: BillPayload;
    }): Promise<{
        id: string;
        user: {
            name: string;
            email: string;
            houseNumber: string | null;
            id: string;
        };
        createdAt: Date;
        updatedAt: Date;
        status: import("../../../generated/prisma").$Enums.BillStatus;
        userId: string;
        feeType: {
            name: string;
            id: string;
            billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        };
        amount: Prisma.Decimal;
        periodMonth: number | null;
        periodYear: number | null;
        billCode: string;
        dueDate: Date;
        paidAt: Date | null;
        batchId: string | null;
        feeTypeId: string;
    }>;
}
//# sourceMappingURL=bill.service.d.ts.map