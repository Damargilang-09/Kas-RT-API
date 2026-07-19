import type { Request, Response, NextFunction } from "express";
import { ResponseError } from "../utils/response-error.util";
import { StatusCodes } from "http-status-codes";
import { JWTUtil } from "../utils/jwt.util";
import { UserRole, UserStatus } from "../../generated/prisma";
import { prisma } from "../configs/prisma-client.config";

export class AuthMiddleware {
  static async authenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    if (!token) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        "Format token salah atau token tidak ditemukan",
      );
    }

    const payload = JWTUtil.verifyToken(token);

    const authenticatedUser = await prisma.user.findFirst({
      where: {
        id: payload.id,
        status: UserStatus.active,
        deleted_at: null,
      },
      select: { id: true, role: true },
    });

    if (!authenticatedUser) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        "Sesi tidak valid, Silahkan login kembali",
      );
    }

    res.locals.payload = authenticatedUser;

    next();
  }

  static authorized(allowedRoles: UserRole[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
      const payload = res.locals.payload;

      if (!payload?.role || !allowedRoles.includes(payload.role)) {
        throw new ResponseError(
          StatusCodes.FORBIDDEN,
          "User tidak memiliki akses!",
        );
      }
      next();
    };
  }
}
