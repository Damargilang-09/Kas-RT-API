import type { UserDetailInput, UserListQueryInput, UserUpdateInput } from "./user.validation";
export declare class UserService {
    static getUsers({ query }: UserListQueryInput): Promise<{
        users: {
            name: string;
            email: string;
            houseNumber: string | null;
            address: string | null;
            id: string;
            role: import("../../../generated/prisma").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma").$Enums.UserStatus;
        }[];
        meta: {
            page: number;
            totalData: number;
            totalPage: number;
        };
    }>;
    static getUserDetail({ params }: UserDetailInput): Promise<{
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
    static updateUser({ params, body }: UserUpdateInput): Promise<{
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
//# sourceMappingURL=user.service.d.ts.map