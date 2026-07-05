import * as z from "zod";
import { ApprovalStatus, BillStatus } from "../../../generated/prisma";

//kirim id lewat body sementara karna belum di integrasikan dengan auth
export class PaymentValidation {
  static readonly CREATE_PAYMENT = z.object({
    params: z.object({
      billId: z.string().uuid("format id tagihan invalid"),
    }),
    body: z.object({
      userId: z.string().uuid("format user id invalid"),
      paymentMethod: z.string().trim().min(1, "Sertakan metode pembayaran").max(25).optional(),
    }),
  });

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

  static readonly PAYMENT_DETAIL = z.object({
    params: z.object({
      id: z.string().uuid("format id pembayaran invalid"),
    }),
  });

  static readonly APROVAL_PAYMENT = z.object({
    params: z.object({
      id: z.string().uuid("format id pembayaran invalid"),
    }),
    body: z.object({
      userId: z.string().uuid("format user id invalid"),
      status: z.enum([ApprovalStatus.approved, ApprovalStatus.rejected], {
        error: "status is invalid",
      }),
      billStatus: z.enum([BillStatus.paid, BillStatus.unpaid], {
        error: "Bill status is invalid",
      }),
    }),
  });
}

export type PaymentCreateInput = z.infer<
  typeof PaymentValidation.CREATE_PAYMENT
>;
export type PaymentListQueryInput = z.infer<
  typeof PaymentValidation.LIST_QUERY
>;
export type PaymentDetailInput = z.infer<
  typeof PaymentValidation.PAYMENT_DETAIL
>;
export type PaymentApprovalInput = z.infer<
  typeof PaymentValidation.APROVAL_PAYMENT
>;
