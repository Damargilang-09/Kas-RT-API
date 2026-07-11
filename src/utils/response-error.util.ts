export class ResponseError extends Error {
  statusCode: number;
  isExpose: boolean;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.isExpose = true;

    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}