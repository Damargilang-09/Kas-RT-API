import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.util";
import {
  ApprovalIncomeInput,
  DetailIncomeInput,
  IncomeCreateInput,
} from "./income.validation";
import { AllListQueryInput } from "../../validation/queryValidation";
import { Prisma } from "../../../generated/prisma";
import { Result } from "pg";

export class IncomeService {
  static async create({ body }: IncomeCreateInput) {
    const findIncome = await prisma.income.findFirst({
      where: { income_code: body.income_code },
    });

    if (findIncome)
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Kode pencatatan income sudah digunakan",
      );

    const createdIncome = await prisma.income.create({
      data: {
        created_by: body.userId,
        income_code: body.income_code,
        title: body.title,
        description: body.description,
        amount: body.amount,
        income_date: body.income_date,
        periodMonth: body.income_date.getMonth() + 1,
        periodYear: body.income_date.getFullYear(),
      },
      include: { users: { select: { name: true } } },
    });
    const { created_by, ...formattedIncome } = createdIncome;
    return formattedIncome;
  }
  static async getAll({ query }: AllListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.IncomeWhereInput = { deleted_at: null };

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
          income_code: {
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

    const [income, totalIncome] = await Promise.all([
      prisma.income.findMany({
        where,
        skip,
        orderBy: { created_at: "desc" },
        include: {
          users: { select: { name: true } },
          approvedByUser: { select: { name: true } },
        },
      }),
      prisma.income.count({ where }),
    ]);
    const formattedIncome = income.map((income) => ({
      id: income.id,
      income_code: income.income_code,
      title: income.title,
      description: income.description,
      amount: income.amount,
      income_date: income.income_date,
      status: income.status,
      periodMonth: income.periodMonth,
      periodYear: income.periodYear,
      approve_at: income.approved_at,
      created_by: income.users?.name,
      approvedByUser: income.approvedByUser?.name ?? null,
    }));

    return {
      formattedIncome,
      meta: {
        page: query.page,
        limit: take,
        totalData: totalIncome,
        totalPage: Math.ceil(totalIncome / take),
      },
    };
  }
  static async getById({ params }: DetailIncomeInput) {
    const findIncome = await prisma.income.findFirst({
      where: { id: params.id, deleted_at: null },
      include: {
        approvedByUser: { select: { name: true } },
        users: { select: { name: true } },
      },
    });

    if (!findIncome)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Catatan pemasukan tidak ditemukan",
      );

    const { created_by, approved_by, ...safeIncome } = findIncome;

    return safeIncome;
  }
  static async approve({ params, body }: ApprovalIncomeInput) {
    const findIncome = await prisma.income.findFirst({
      where: { id: params.id, deleted_at: null },
    });

    if (!findIncome)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Catatan pemasukan tidak ditemukan",
      );

    if (findIncome.status !== "pending")
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Pengajuan ini sudah diproses sebelumnya dan tidak dapat diubah kembali!",
      );

    const result = await prisma.$transaction(async (tx) => {
      const approveIncome = await tx.income.update({
        where: { id: findIncome.id },
        data: {
          approved_by:
            body.status === "approved" ? (body.userId ?? null) : null,
          rejected_reason:
            body.status === "rejected" ? (body.rejected_reason ?? null) : null,
          approved_at: body.status === "approved" ? new Date() : null,
          status: body.status,
        },
      });

      if (body.status === "approved")
        await tx.cashTransaction.create({
          data: {
            amount: findIncome.amount,
            sourceId: findIncome.id,
            sourceType: "income",
            type: "income",
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
          },
        });
      return approveIncome;
    });

    const { id, created_by, approved_by, ...formattedIncome } = result;

    return formattedIncome;
  }
  static async delete({ params }: DetailIncomeInput) {
    const findIncome = await prisma.income.findFirst({
      where: { id: params.id, deleted_at: null },
    });

    if (!findIncome)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Catatan pemasukan tidak ditemukan",
      );

    if (findIncome.status !== "pending")
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Hanya pengajuan dengan status pending yang dapat dihapus",
      );

    await prisma.income.update({
      where: { id: findIncome.id },
      data: { deleted_at: new Date() },
    });
  }
}
