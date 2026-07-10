import * as z from "zod";
import { ApprovalStatus } from "../../../generated/prisma";

export class IncomeValidation {
  static readonly CREATE_INCOME = z.object({
    body: z.object({
      userId: z.string().uuid("format user id invalid"),
      income_code: z
        .string()
        .trim()
        .min(1, "input kode pencatatan income")
        .max(100, "Input kode maximum 100 karakter"),
      title: z
        .string()
        .trim()
        .min(1, "input judul pencatatan income")
        .max(200, "Input judul maksimal 200 karakter"),
      description: z
        .string()
        .trim()
        .min(1, "Input deskripsi pencatatan pemasukan"),
      amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
      income_date: z.coerce.date({
        error: "Tanggal peencatatan income tidak valid",
      }),
    }),
  });

  static readonly GET_DETAIL_INCOME = z.object({
    params: z.object({
      id: z.string().uuid("format id income invalid"),
    }),
  });

  static readonly APPROVAL_INCOME = z.object({
    params: z.object({
      id: z.string().uuid("format id income invalid"),
    }),
    body: z.object({
      userId: z.string().uuid("format userId salah"),
      rejected_reason: z
        .string()
        .min(1, "rejected reason is required field")
        .optional(),
      status: z.enum([ApprovalStatus.approved, ApprovalStatus.rejected], {
        error: "Income status is invalid",
      }),
    }),
  });
}

export type IncomeCreateInput = z.infer<
typeof IncomeValidation.CREATE_INCOME
>;
export type DetailIncomeInput = z.infer<
  typeof IncomeValidation.GET_DETAIL_INCOME
>;
export type ApprovalIncomeInput = z.infer<
  typeof IncomeValidation.APPROVAL_INCOME
>;
