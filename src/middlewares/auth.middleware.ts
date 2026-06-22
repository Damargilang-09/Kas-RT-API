import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/app-error";
import { verifyToken } from "../utils/jwt";
import type { AuthenticatedRequest, JwtPayload } from "../modules/Auth/auth.types";

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Token tidak ditemukan");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Token tidak valid");
  }

  const payload = verifyToken(token);

  req.user = payload;
  next();
}

export function authorizeRoles(...allowedRoles: JwtPayload["role"][]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "User belum login");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Anda tidak memiliki akses untuk fitur ini"
      );
    }

    next();
  };
}
