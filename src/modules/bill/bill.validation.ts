import * as zod from "zod";
import { BillStatus } from "../../../generated/prisma";

export class BillValidation {
  static readonly GENERATE = zod.object({
    body: zod.object({
      feeTypeId: zod.string().min(1, "Jenis tagihan wajib diisi"),
      periodMonth: zod.coerce.number().int().min(1).max(12).optional(),
      periodYear: zod.coerce.number().int().min(2000).optional(),
      dueDate: zod.coerce.date(),
    }),
  });

  static readonly LIST_QUERY = zod.object({
    query: zod.object({
      page: zod.coerce.number().int().min(1).default(1),
      limit: zod.coerce.number().int().min(1).max(100).default(10),
      status: zod
        .enum([
          BillStatus.cancelled,
          BillStatus.overdue,
          BillStatus.paid,
          BillStatus.pending,
          BillStatus.unpaid,
        ])
        .optional(),
      feeTypeId: zod.string().optional(),
      periodMonth: zod.coerce.number().int().min(1).max(12).optional(),
      periodYear: zod.coerce.number().int().min(2000).optional(),
    }),
  });
}

export type GenerateBillInput = zod.infer<typeof BillValidation.GENERATE>;
export type BillListQueryInput = zod.infer<typeof BillValidation.LIST_QUERY>;
