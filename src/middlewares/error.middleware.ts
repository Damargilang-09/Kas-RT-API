import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const ErrorMiddleware = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  console.error(err);

  const statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err?.isExpose ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};