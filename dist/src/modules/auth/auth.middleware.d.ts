import type { Request, Response, NextFunction } from "express";
export declare class AuthMiddleware {
    static authenticated(req: Request, res: Response, next: NextFunction): void;
    static authorized(allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=auth.middleware.d.ts.map