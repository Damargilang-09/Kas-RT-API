import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.utils";
import {
  ExpensesApprovingInput,
  ExpensesCreateInput,
  ExpensesDetailInput,
} from "./expenses.validation";
import { AllListQueryInput } from "../../validation/queryValidation";
import { Prisma } from "../../../generated/prisma";
import { CloudinaryUtil } from "../../utils/cloudinary.utils";

export class ExpensesService {
  //TODO ini masih sementara menyisipkan user id lewat body karna belum di integrasikan dengan auth
  static async create(
    { body }: ExpensesCreateInput,
    files: Express.Multer.File[],
  ) {
    const findExpense = await prisma.expense.findFirst({
      where: { expenseCode: body.expenseCode, deleted_at: null },
    });

    if (findExpense)
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Kode pencatatan pengeluaran sudah digunakan",
      );

    if (!files || files.length === 0)
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Bukti pengeluaran wajib diunggah",
      );

    let uploadedImages: string[];
    try {
      uploadedImages = await Promise.all(
        files.map((file) => CloudinaryUtil.uploadStream(file.buffer)),
      );
    } catch (error) {
      throw new ResponseError(
        StatusCodes.BAD_GATEWAY,
        "Gagal mengunggah bukti pengeluaran, silakan coba lagi",
      );
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const createdExpense = await tx.expense.create({
          data: {
            requestedById: body.userId,
            expenseCode: body.expenseCode,
            title: body.title,
            description: body.description,
            amount: body.amount,
            expenseDate: body.expenseDate,
            periodMonth: body.expenseDate.getMonth() + 1,
            periodYear: body.expenseDate.getFullYear(),
          },
        });

        await tx.expenses_images.createMany({
          data: uploadedImages.map((url) => ({
            attachment_url: url,
            expenses_id: createdExpense.id,
            created_by: body.userId,
          })),
        });

        return createdExpense;
      });

      return result;
    } catch (error) {
      // rollback manual: hapus semua gambar yang udah kepalang ke-upload
      const publicIds = uploadedImages.map((url) =>
        CloudinaryUtil.extractPublicId(url),
      );
      await CloudinaryUtil.delete(publicIds).catch(() => {});
      throw error;
    }
  }

  static async getAll({ query }: AllListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.ExpenseWhereInput = { deleted_at: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.year) {
      where.periodYear = query.year;
    }
    if (query.month) {
      where.periodMonth = query.month;
    }

    if (query.search) {
      where.OR = [
        {
          expenseCode: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [expense, totalExpenses] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          approvedBy: { select: { name: true } },
          requestedBy: { select: { name: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const formattedExpenses = expense.map((expense) => ({
      id: expense.id,
      expenseCode: expense.expenseCode,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      status: expense.status,
      approvedAt: expense.approvedAt,
      rejectedReason: expense.rejectedReason,
      approvedBy: expense.approvedBy?.name ?? null,
      requestedBy: expense.requestedBy.name,
    }));
    return {
      formattedExpenses,
      meta: {
        page: query.page,
        limit: take,
        totalData: totalExpenses,
        totalPage: Math.ceil(totalExpenses / take),
      },
    };
  }
  static async getById({ params }: ExpensesDetailInput) {
    const findExpenses = await prisma.expense.findFirst({
      where: {
        AND: [{ id: params.id }, { deleted_at: null }],
      },
      include: {
        expenses_images: { where: { deleted_at: null } },
        approvedBy: { select: { name: true } },
        requestedBy: { select: { name: true } },
      },
    });

    if (!findExpenses)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Detail catatan pengeluaran tidak di temukan!",
      );

    return {
      id: findExpenses.id,
      expensesCode: findExpenses.expenseCode,
      title: findExpenses.title,
      description: findExpenses.description,
      amount: findExpenses.amount,
      expenseDate: findExpenses.expenseDate,
      approvedAt: findExpenses.approvedAt,
      rejectedReason: findExpenses.rejectedReason,
      status: findExpenses.status,
      expenses_images: findExpenses.expenses_images,
      approvedBy: findExpenses.approvedBy?.name,
      requestedBy: findExpenses.requestedBy?.name,
    };
  }
  static async approve({ params, body }: ExpensesApprovingInput) {
    const findExpenses = await prisma.expense.findUnique({
      where: {
        id: params.id,
        deleted_at: null,
      },
    });
    if (!findExpenses)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Approval pengajuan pengheluaran tidak ditemukan",
      );
    if (findExpenses.status !== "pending")
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Pengajuan ini sudah diproses sebelumnya dan tidak dapat diubah kembali",
      );

    const result = await prisma.$transaction(async (tx) => {
      const UpdateExpenses = await tx.expense.update({
        where: { id: params.id, deleted_at: null },
        data: {
          approvedById:
            body.status === "rejected" ? (body.userId ?? null) : null,
          approvedAt: body.status === "approved" ? new Date() : null,
          rejectedReason:
            body.status === "rejected" ? (body.rejectedReason ?? null) : null,
          status: body.status,
        },
        include: {
          requestedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
        },
      });
      await tx.expenses_images.updateMany({
        where: { expenses_id: params.id },
        data: {
          approved_by: body.userId,
          status: body.status,
        },
      });
      return UpdateExpenses;
    });

    return result;
  }
  static async delete({ params }: ExpensesDetailInput) {
    const findExpense = await prisma.expense.findUnique({
      where: {
        id: params.id,
        deleted_at: null,
      },
    });

    if (!findExpense)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Pengajuan pengeluaran tidak ditemukan",
      );

    if (findExpense.status !== "pending")
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Hanya pengajuan dengan status pending yang dapat dihapus",
      );

    const images = await prisma.expenses_images.findMany({
      where: { expenses_id: params.id },
    });

    if (images.length > 0) {
      const publicIds = images
        .map((img) => img.attachment_url)
        .filter((url): url is string => !!url)
        .map((url) => CloudinaryUtil.extractPublicId(url));

      if (publicIds.length > 0) {
        await CloudinaryUtil.delete(publicIds).catch(() => {});
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: { id: params.id },
        data: { deleted_at: new Date() },
      });

      await tx.expenses_images.updateMany({
        where: { expenses_id: params.id },
        data: { deleted_at: new Date() },
      });
    });
  }
}
