import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const ErrorMiddleware = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  console.log(err)
  res.status(err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err?.isExpose ? err?.message : 'Internal Server Error',
    data: null,
  });
};