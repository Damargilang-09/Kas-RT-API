import * as z from "zod";
import { ApprovalStatus, BillStatus } from "../../../generated/prisma";

//kirim id lewat body sementara karna belum di integrasikan dengan auth
export class PaymentValidation {
  static readonly CREATE_PAYMENT = z.object({
    params: z.object({
      billId: z.string().uuid("format id tagihan invalid"),
    }),
    body: z.object({
      paymentMethod: z.string().trim().min(1, "Sertakan metode pembayaran").max(25).optional(),
    }),
  });

  static readonly PAYMENT_DETAIL = z.object({
    params: z.object({
      id: z.string().uuid("format id pembayaran invalid"),
    }),
  });

  static readonly APPROVAL_PAYMENT = z.object({
    params: z.object({
      id: z.string().uuid("format id pembayaran invalid"),
    }),
    body: z.object({
      status: z.enum([ApprovalStatus.approved, ApprovalStatus.rejected], {
        error: "status is invalid",
      }),
      rejectedReason: z
              .string()
              .min(1, "rejected reason is required field")
              .optional(),
    }),
  });
}

export type PaymentCreateInput = z.infer<
  typeof PaymentValidation.CREATE_PAYMENT
>;

export type PaymentDetailInput = z.infer<
  typeof PaymentValidation.PAYMENT_DETAIL
>;
export type PaymentApprovalInput = z.infer<
  typeof PaymentValidation.APPROVAL_PAYMENT
>;
