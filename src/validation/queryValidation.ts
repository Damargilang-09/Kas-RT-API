import * as z from "zod";
import { ApprovalStatus } from "../../generated/prisma";

export class QueryValidation {
  static readonly LIST_QUERY = z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),

      limit: z.coerce.number().int().min(1).max(100).default(10),

      search: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().trim().optional(),
      ),

      status: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z
          .enum([
            ApprovalStatus.approved,
            ApprovalStatus.pending,
            ApprovalStatus.rejected,
          ])
          .optional(),
      ),
       month: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number().int().min(1).max(12).optional(),
      ),
      year: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number().int().min(2000).max(2100).optional(),
      ),
    }),
  });
}

export type AllListQueryInput = z.infer<typeof QueryValidation.LIST_QUERY>;

export type userPayload = {
  id: string;
  role: string;
};