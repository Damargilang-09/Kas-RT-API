import { Prisma } from "../../../generated/prisma";
import type { CreateFeeTypeInput, DeleteFeeTypeInput, FeeTypeDetailInput, UpdateFeeTypeInput } from "./fee.validation";
export type FeeTypePayload = {
    id: string;
    role: string;
};
export declare class FeeService {
    static getFeeTypes(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: Prisma.Decimal;
        dueDay: number | null;
        billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        createdBy: {
            name: string;
            email: string;
            houseNumber: string | null;
            address: string | null;
            id: string;
            role: import("../../../generated/prisma").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            deleted_at: Date | null;
            status: import("../../../generated/prisma").$Enums.UserStatus;
            passwordHash: string;
        };
    }[]>;
    static createFeeType({ body }: CreateFeeTypeInput, payload: FeeTypePayload): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: Prisma.Decimal;
        dueDay: number | null;
        billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        createdBy: {
            name: string;
            email: string;
            houseNumber: string | null;
            address: string | null;
            id: string;
            role: import("../../../generated/prisma").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            deleted_at: Date | null;
            status: import("../../../generated/prisma").$Enums.UserStatus;
            passwordHash: string;
        };
    }>;
    static getFeeTypeDetail({ params }: FeeTypeDetailInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: Prisma.Decimal;
        dueDay: number | null;
        billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        createdBy: {
            name: string;
            email: string;
            houseNumber: string | null;
            address: string | null;
            id: string;
            role: import("../../../generated/prisma").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            deleted_at: Date | null;
            status: import("../../../generated/prisma").$Enums.UserStatus;
            passwordHash: string;
        };
    }>;
    static updateFeeType({ params, body, payload, }: UpdateFeeTypeInput & {
        payload: FeeTypePayload;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: Prisma.Decimal;
        dueDay: number | null;
        billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        createdBy: {
            name: string;
            email: string;
            houseNumber: string | null;
            address: string | null;
            id: string;
            role: import("../../../generated/prisma").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            deleted_at: Date | null;
            status: import("../../../generated/prisma").$Enums.UserStatus;
            passwordHash: string;
        };
    }>;
    static deleteFeeType({ params }: DeleteFeeTypeInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: Prisma.Decimal;
        dueDay: number | null;
        billingPeriod: import("../../../generated/prisma").$Enums.BillingPeriod;
        createdBy: {
            name: string;
            email: string;
            houseNumber: string | null;
            address: string | null;
            id: string;
            role: import("../../../generated/prisma").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            deleted_at: Date | null;
            status: import("../../../generated/prisma").$Enums.UserStatus;
            passwordHash: string;
        };
    }>;
}
//# sourceMappingURL=fee.service.d.ts.map