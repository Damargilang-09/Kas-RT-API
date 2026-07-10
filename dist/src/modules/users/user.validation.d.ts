import * as zod from "zod";
export declare class UserValidation {
    static readonly LIST_QUERY: zod.ZodObject<{
        query: zod.ZodObject<{
            page: zod.ZodDefault<zod.z.ZodCoercedNumber<unknown>>;
            limit: zod.ZodDefault<zod.z.ZodCoercedNumber<unknown>>;
            search: zod.ZodOptional<zod.ZodString>;
            status: zod.ZodOptional<zod.ZodEnum<{
                active: "active";
                inactive: "inactive";
            }>>;
            role: zod.ZodOptional<zod.ZodEnum<{
                bendahara: "bendahara";
                warga: "warga";
            }>>;
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
            status: zod.ZodOptional<zod.ZodEnum<{
                active: "active";
                inactive: "inactive";
            }>>;
            role: zod.ZodOptional<zod.ZodEnum<{
                bendahara: "bendahara";
                warga: "warga";
            }>>;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
}
export type UserListQueryInput = zod.infer<typeof UserValidation.LIST_QUERY>;
export type UserDetailInput = zod.infer<typeof UserValidation.DETAIL>;
export type UserUpdateInput = zod.infer<typeof UserValidation.UPDATE>;
//# sourceMappingURL=user.validation.d.ts.map