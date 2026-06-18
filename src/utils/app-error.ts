import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(public statusCode: StatusCodes, message: string) {
    super(message);
    this.name = "AppError";
  }
}