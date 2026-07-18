import * as zod from "zod";
import { BillStatus } from "../../../generated/prisma";

export class BillValidation {
  static readonly GENERATE = zod.object({
    body: zod.object({
      feeTypeId: zod.string().min(1, "Jenis tagihan wajib diisi"),
      periodMonth: zod.coerce.number().int().min(1).max(12).optional(),
      periodYear: zod.coerce.number().int().min(2000).optional(),
      dueDate: zod.coerce.date().optional(),
    }),
  });

  static readonly LIST_QUERY = zod.object({
    query: zod.object({
      page: zod.coerce.number().int().min(1).default(1),
      limit: zod.coerce.number().int().min(1).max(100).default(10),
      status: zod.nativeEnum(BillStatus).optional(),
      feeTypeId: zod.string().optional(),
      batchId: zod.string().optional(),
      periodMonth: zod.coerce.number().int().min(1).max(12).optional(),
      periodYear: zod.coerce.number().int().min(2000).optional(),
    }),
  });

  static readonly DETAIL = zod.object({
    params: zod.object({
      id: zod.string().min(1, "ID Bill wajib diisi"),
    }),
  });

  static readonly CANCEL_BATCH = zod.object({
    body: zod.object({
      batchId: zod.string().min(1, "Batch ID wajib diisi"),
    }),
  });

  static readonly MY_BILL_DETAIL = BillValidation.DETAIL;
}

export type GenerateBillInput = zod.infer<typeof BillValidation.GENERATE>;
export type BillListQueryInput = zod.infer<typeof BillValidation.LIST_QUERY>;
export type BillDetailInput = zod.infer<typeof BillValidation.DETAIL>;
export type CancelBatchBillInput = zod.infer<
  typeof BillValidation.CANCEL_BATCH
>;
export type MyBillDetailInput = zod.infer<typeof BillValidation.MY_BILL_DETAIL>;

export type BillPayload = {
  id: string;
  role: string;
};
