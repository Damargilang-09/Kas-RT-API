import jwt from "jsonwebtoken";
import type { UserRole } from "../../generated/prisma";
export interface JWTPayload {
    id: string;
    role?: UserRole;
}
export declare class JWTUtil {
    static signToken(payload: JWTPayload): string;
    static verifyToken(token: string, secretKey?: string): string | jwt.JwtPayload;
}
//# sourceMappingURL=jwt.util.d.ts.map