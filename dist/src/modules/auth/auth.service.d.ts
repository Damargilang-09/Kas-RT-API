import type { AuthLoginRequest, AuthRegisterRequest } from "./auth.validation";
export declare class AuthService {
    static register({ body }: AuthRegisterRequest): Promise<{
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
    }>;
    static login({ body }: AuthLoginRequest): Promise<{
        safeUser: {
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
        };
        token: string;
    }>;
    static getMe(userId: string): Promise<{
        name: string;
        email: string;
        houseNumber: string | null;
        address: string | null;
        id: string;
        role: import("../../../generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../../generated/prisma").$Enums.UserStatus;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map