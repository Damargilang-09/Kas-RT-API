import * as zod from "zod";
import { BillingPeriod } from "../../../generated/prisma";

const dueDayValidation = zod.coerce
  .number()
  .int("Tanggal jatuh tempo harus berupa bilangan bulat")
  .min(1, "Tanggal jatuh tempo minimal tanggal 1")
  .max(31, "Tanggal jatuh tempo maksimal tanggal 31");

export class FeeValidation {
  static readonly CREATE = zod.object({
    body: zod
      .object({
        name: zod
          .string()
          .trim()
          .min(1, "Nama jenis tagihan wajib diisi")
          .max(150, "Nama jenis tagihan maksimal 150 karakter"),
        amount: zod.coerce.number().positive("Nominal harus lebih dari 0"),
        description: zod.string().trim().optional(),
        billingPeriod: zod.enum([BillingPeriod.monthly, BillingPeriod.once]),
        dueDay: dueDayValidation.optional(),
      })
      .refine(
        (body) =>
          body.billingPeriod !== BillingPeriod.monthly ||
          body.dueDay !== undefined,
        {
          message: "tanggal jatuh tempo wajib diisi untuk iuran bulanan",
          path: ["dueDay"],
        },
      ),
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
        name: zod
          .string()
          .trim()
          .min(1, "Nama jenis tagihan wajib diisi")
          .max(150, "Nama jenis tagihan maksimal 150 karakter")
          .optional(),
        amount: zod.coerce
          .number()
          .positive("Nominal harus lebih dari 0")
          .optional(),
        description: zod.string().trim().optional(),
        billingPeriod: zod
          .enum([BillingPeriod.monthly, BillingPeriod.once])
          .optional(),
        dueDay: dueDayValidation.optional(),
      })
      .refine(
        (body) =>
          body.name !== undefined ||
          body.amount !== undefined ||
          body.description !== undefined ||
          body.billingPeriod !== undefined ||
          body.dueDay !== undefined,
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
