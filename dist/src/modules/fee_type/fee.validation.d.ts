import * as zod from "zod";
export declare class FeeValidation {
    static readonly CREATE: zod.ZodObject<{
        body: zod.ZodObject<{
            name: zod.ZodString;
            amount: zod.z.ZodCoercedNumber<unknown>;
            description: zod.ZodOptional<zod.ZodString>;
            billingPeriod: zod.ZodEnum<{
                once: "once";
                monthly: "monthly";
            }>;
            dueDay: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly DETAIL: zod.ZodObject<{
        params: zod.ZodObject<{
            id: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly UPDATE: zod.ZodObject<{
        params: zod.ZodObject<{
            id: zod.ZodString;
        }, zod.z.core.$strip>;
        body: zod.ZodObject<{
            name: zod.ZodOptional<zod.ZodString>;
            amount: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
            description: zod.ZodOptional<zod.ZodString>;
            billingPeriod: zod.ZodOptional<zod.ZodEnum<{
                once: "once";
                monthly: "monthly";
            }>>;
            dueDay: zod.ZodOptional<zod.z.ZodCoercedNumber<unknown>>;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly DELETE: zod.ZodObject<{
        params: zod.ZodObject<{
            id: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
}
export type CreateFeeTypeInput = zod.infer<typeof FeeValidation.CREATE>;
export type FeeTypeDetailInput = zod.infer<typeof FeeValidation.DETAIL>;
export type UpdateFeeTypeInput = zod.infer<typeof FeeValidation.UPDATE>;
export type DeleteFeeTypeInput = zod.infer<typeof FeeValidation.DELETE>;
//# sourceMappingURL=fee.validation.d.ts.map