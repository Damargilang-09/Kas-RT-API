import * as zod from "zod";
import { UserRole, UserStatus } from "../../../generated/prisma";
export class SuperAdminValidation {
  static readonly LIST_QUERY = zod.object({
    query: zod.object({
      page: zod.coerce.number().int().min(1).default(1),
      limit: zod.coerce.number().int().min(1).max(100).default(10),
      search: zod.string().trim().min(1).max(100).optional(),
      status: zod.enum([UserStatus.active, UserStatus.inactive]).optional(),
      role: zod
        .enum([UserRole.bendahara, UserRole.warga, UserRole.ketuaRT])
        .optional(),
    }),
  });

  static readonly GET_DETAIL = zod.object({
    params: zod.object({
      id: zod.string().min(1, "ID User Wajib Diisi"),
    }),
  });

  static readonly UPDATE_KETUA = SuperAdminValidation.GET_DETAIL;

  static readonly REMOVE_KETUA = SuperAdminValidation.GET_DETAIL;
}

export type GetUserListInput = zod.infer<
  typeof SuperAdminValidation.LIST_QUERY
>;
export type GetUserDetailInput = zod.infer<
  typeof SuperAdminValidation.GET_DETAIL
>;
export type UpdateKetuaRTInput = zod.infer<
  typeof SuperAdminValidation.UPDATE_KETUA
>;
export type RemoveKetuaRTInput = zod.infer<
  typeof SuperAdminValidation.REMOVE_KETUA
>;
export type SuperAdminPayload = {
  id: string;
  role: string;
};
