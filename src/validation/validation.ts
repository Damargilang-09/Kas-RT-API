import { StatusCodes } from 'http-status-codes';
import { ZodType } from 'zod';
import { ResponseError } from '../utils/response-error.utils';

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ResponseError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      result.error.issues.map((issue) => issue.message).join(', '),
    );
  }

  return result.data;
}