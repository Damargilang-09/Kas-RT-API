import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from "../configs/env.config";
import type { StringValue } from "ms";
import { ResponseError } from "./response-error.util";
import { StatusCodes } from "http-status-codes";
import type { UserRole } from "../../generated/prisma";

export interface JWTPayload {
  id: string;
  role?: UserRole;
}
export class JWTUtil {
  static signToken(payload: JWTPayload) {
    if (!JWT_SECRET_KEY) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "JWT_SECRET_KEY is not configured",
      );
    }

    return jwt.sign({ ...payload }, JWT_SECRET_KEY! as string, {
      expiresIn: JWT_EXPIRES_IN! as StringValue,
    });
  }

  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET_KEY!);
  }
}
