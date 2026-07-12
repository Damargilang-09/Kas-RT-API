import * as z from "zod";
import { ApprovalStatus } from "../../../generated/prisma";

//kirim id lewat body sementara karna belum di integrasikan dengan auth
export class ExpensesValidation {
  static readonly CREATE_EXPENSES = z.object({
    body: z.object({
      expenseCode: z
        .string()
        .trim()
        .min(1, "Masukan kode pengeluaran")
        .max(100, "Input kode maximum 100 karakter"),
      title: z
        .string()
        .trim()
        .min(1, "Masukan judul pengeluaran")
        .max(200, "Input judul maksimal 200 karakter"),
      description: z.string().trim().min(1, "Masukan deskripsi pengeluaran"),
      amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
      expenseDate: z.coerce.date({
        error: "Tanggal pengeluaran tidak valid",
      }),
    }),
  });


  static readonly EXPENSES_DETAIL = z.object({
    params: z.object({
      id: z.string().uuid("format id expenses invalid"),
    }),
  });

  static readonly APPROVAL_EXPENSES = z.object({
    params: z.object({
      id: z.string().uuid("format id catatan pengeluaran salah!"),
    }),
    body: z.object({
      rejectedReason: z
        .string()
        .min(1, "rejected reason is required field")
        .optional(),
      status: z.enum([ApprovalStatus.approved, ApprovalStatus.rejected], {
        error: "expenses status is invalid",
      }),
    }),
  });
}

export type ExpensesCreateInput = z.infer<
  typeof ExpensesValidation.CREATE_EXPENSES
>;
export type ExpensesDetailInput = z.infer<
  typeof ExpensesValidation.EXPENSES_DETAIL
>;
export type ExpensesApprovingInput = z.infer<
  typeof ExpensesValidation.APPROVAL_EXPENSES
>;
