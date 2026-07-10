import * as zod from "zod";
export declare class AuthValidation {
    static readonly REGISTER_USER: zod.ZodObject<{
        body: zod.ZodObject<{
            name: zod.ZodString;
            email: zod.ZodPipe<zod.ZodString, zod.ZodTransform<string, string>>;
            password: zod.ZodString;
            houseNumber: zod.ZodString;
            address: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
    static readonly LOGIN_USER: zod.ZodObject<{
        body: zod.ZodObject<{
            email: zod.ZodPipe<zod.ZodString, zod.ZodTransform<string, string>>;
            password: zod.ZodString;
        }, zod.z.core.$strip>;
    }, zod.z.core.$strip>;
}
export type AuthRegisterRequest = zod.infer<typeof AuthValidation.REGISTER_USER>;
export type AuthLoginRequest = zod.infer<typeof AuthValidation.LOGIN_USER>;
//# sourceMappingURL=auth.validation.d.ts.map