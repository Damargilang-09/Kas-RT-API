import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ResponseError } from "../utils/response-error.util";
import { logger } from "../configs/logger.config";

export const ErrorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  if (err instanceof ResponseError) {
    logger.warn(message, { path: req.url, status: stack });
  } else {
    logger.error(message, { path: req.url, status: stack });
  }
  
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

  console.error(err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
    data: null,
  });
};
