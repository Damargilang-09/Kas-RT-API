import type { Request, Response, NextFunction } from "express";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";
import { JWTUtil } from "../../utils/jwt.util";

export class AuthMiddleware {
  static authenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    console.log("Token from COOKIE:", token);

    if (!token) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        "Format token salah atau token tidak ditemukan",
      );
    }

    const payload = JWTUtil.verifyToken(token);
    console.log("JWT PAYLOAD:", payload);
    res.locals.payload = payload;

    next();
  }

  static authorized(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const payload = res.locals.payload;

      console.log("ALLOWED ROLES:", allowedRoles);
      console.log("USER ROLE:", payload?.role);

      if (!payload.role || !allowedRoles.includes(payload.role)) {
        throw new ResponseError(
          StatusCodes.FORBIDDEN,
          "User tidak memiliki akses!",
        );
      }
      next();
    };
  }
}
