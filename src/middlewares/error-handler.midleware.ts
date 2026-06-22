import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AppError } from "../utils/app-error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err); // error tak terduga, log buat debugging

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
}