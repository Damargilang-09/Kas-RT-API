import type { Request, Response, NextFunction } from "express";

import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ResponseError } from "../utils/response-error.util";

export const ErrorMiddleware = (
  err: unknown,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  if (err instanceof ZodError) {
    const firstError = err.issues[0];

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: firstError?.message ?? "Data tidak valid",
      data: null,
    });
  }

  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
    data: null,
  });
};
