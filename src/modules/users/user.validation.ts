import * as zod from "zod";
import { UserRole, UserStatus } from "../../../generated/prisma";

export class UserValidation {
  static readonly LIST_QUERY = zod.object({
    query: zod.object({
      page: zod.coerce.number().int().min(1).default(1),
      limit: zod.coerce.number().int().min(1).max(100).default(10),
      search: zod.string().trim().min(1).max(100).optional(),
      status: zod.enum([UserStatus.active, UserStatus.inactive]).optional(),
      role: zod.enum([UserRole.bendahara, UserRole.warga]).optional(),
    }),
  });

  static readonly DETAIL = zod.object({
    params: zod.object({
      id: zod.string().min(1),
    }),
  });

  static readonly UPDATE = zod.object({
    params: zod.object({
      id: zod.string().min(1),
    }),
    body: zod
      .object({
        status: zod.enum([UserStatus.active, UserStatus.inactive]).optional(),
        role: zod.enum([UserRole.bendahara, UserRole.warga]).optional(),
      })
      .refine((body) => body.status || body.role, {
        message: "Minimal status atau role harus disi!",
      }),
  });

  static readonly DELETE = UserValidation.DETAIL;
}

export type UserListQueryInput = zod.infer<typeof UserValidation.LIST_QUERY>;
export type UserDetailInput = zod.infer<typeof UserValidation.DETAIL>;
export type UserUpdateInput = zod.infer<typeof UserValidation.UPDATE>;
export type UserDeleteInput = zod.infer<typeof UserValidation.DELETE>;
