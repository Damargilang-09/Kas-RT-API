import * as zod from "zod";
import { BillingPeriod } from "../../../generated/prisma";

console.log("[FEE_VALIDATION] file loaded");


export class FeeValidation {
  static readonly CREATE = zod.object({
    body: zod.object({
      name: zod.string().trim().min(1, "Nama jenis tagihan wajib diisi"),
      amount: zod.coerce.number().positive("Nominal harus lebih dari 0"),
      description: zod.string().trim().optional(),
      billingPeriod: zod.enum([
        BillingPeriod.monthly,
        BillingPeriod.weekly,
        BillingPeriod.once,
      ]),
      dueDay: zod.coerce.number().int().min(1).max(31).optional(),
    }),
  });

  static readonly DETAIL = zod.object({
    params: zod.object({
      id: zod.string().min(1, "ID jenis tagihan wajib diisi"),
    }),
  });

  static readonly UPDATE = zod.object({
    params: zod.object({
      id: zod.string().min(1, "ID jenis tagihan wajib diisi"),
    }),
    body: zod
      .object({
        name: zod.string().trim().min(1).optional(),
        amount: zod.coerce.number().positive().optional(),
        description: zod.string().trim().optional(),
        billingPeriod: zod
          .enum([
            BillingPeriod.monthly,
            BillingPeriod.once,
            BillingPeriod.weekly,
          ])
          .optional(),
        dueDay: zod.coerce.number().int().min(1).max(31).optional(),
      })
      .refine(
        (body) =>
          body.name ||
          body.amount ||
          body.description ||
          body.billingPeriod ||
          body.dueDay,
        { message: "Minimal salah satu field harus diisi!" },
      ),
  });

  static readonly DELETE = zod.object({
    params: zod.object({
      id: zod.string().min(1, "ID jenis tagihan wajib diisi"),
    }),
  });
}

export type CreateFeeTypeInput = zod.infer<typeof FeeValidation.CREATE>;
export type FeeTypeDetailInput = zod.infer<typeof FeeValidation.DETAIL>;
export type UpdateFeeTypeInput = zod.infer<typeof FeeValidation.UPDATE>;
export type DeleteFeeTypeInput = zod.infer<typeof FeeValidation.DELETE>;
