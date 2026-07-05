import * as z from "zod";
import { ApprovalStatus } from "../../generated/prisma";

export class QueryValidation {
  static readonly LIST_QUERY = z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),

      limit: z.coerce.number().int().min(1).max(100).default(10),

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
    }),
  });
}

export type AllListQueryInput = z.infer<typeof QueryValidation.LIST_QUERY>;
