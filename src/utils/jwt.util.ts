import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from "../configs/env.config";
import type { StringValue } from "ms";
import { ResponseError } from "./response-error.util";
import { StatusCodes } from "http-status-codes";
import type { UserRole } from "../../generated/prisma";

export interface JWTPayload {
  id: string;
  role: UserRole;
}
export class JWTUtil {
  static signToken(payload: JWTPayload) {
    if (!JWT_SECRET_KEY) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "JWT_SECRET_KEY belum dikonfigurasi",
      );
    }

    return jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: JWT_EXPIRES_IN! as StringValue,
    });
  }

  static verifyToken(
    token: string,
    secretKey: string = JWT_SECRET_KEY!,
  ): JWTPayload {
    if (!secretKey) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "JWT_SECRET_KEY belum dikonfigurasi",
      );
    }
    try {
      return jwt.verify(token, secretKey) as JWTPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ResponseError(
          StatusCodes.UNAUTHORIZED,
          "Sesi telah berakhir. Silahkan login kembali",
        );
      }

      if (error instanceof JsonWebTokenError) {
        throw new ResponseError(
          StatusCodes.UNAUTHORIZED,
          "Sesi tidak valid. Silahkan login kembali!",
        );
      }
      throw error;
    }
  }
}
