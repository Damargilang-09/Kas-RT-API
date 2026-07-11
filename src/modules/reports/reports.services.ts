import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { CloudinaryUtil } from "../../utils/cloudinary.utils";
import { getCurrentPeriod, getPreviousPeriod } from "../../utils/date.utils";
import { ResponseError } from "../../utils/response-error.util";
import {
  ReportApprovalInput,
  ReportCreateInput,
  ReportDetailInput,
  ReportQueryInput,
} from "./reports.validation";
import { Prisma } from "../../../generated/prisma";
import { stat } from "node:fs";

export class ReportsServices {
  static async dashboard() {
    const { month: currentMonth, year: currentYear } = getCurrentPeriod();

    const { month: prevMonth, year: prevYear } = getPreviousPeriod(
      currentMonth,
      currentYear,
    );

    const previousReport = await prisma.reports.findFirst({
      where: {
        period_month: prevMonth,
        period_year: prevYear,
        deleted_at: null,
      },
    });

    const previousBalance = previousReport
      ? Number(previousReport.closing_balance)
      : 0;

    const [incomeThisMonth, expensesThismonth] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: {
          type: "income",
          periodMonth: currentMonth,
          periodYear: currentYear,
          deleted_at: null,
        },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: {
          type: "expenses",
          periodMonth: currentMonth,
          periodYear: currentYear,
          deleted_at: null,
        },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeThisMonth._sum.amount ?? 0);
    const expenses = Number(expensesThismonth._sum.amount ?? 0);

    const saldo = previousBalance + income - expenses;

    return {
      period: { month: currentMonth, year: currentYear },
      previousBalance,
      saldo,
      income,
      expenses,
    };
  }

  static async create({ body }: ReportCreateInput, file: Express.Multer.File) {
    const { month: currentMonth, year: currentYear } = getCurrentPeriod();

    const { month: prevMonth, year: prevYear } = getPreviousPeriod(
      currentMonth,
      currentYear,
    );

    const previousReport = await prisma.reports.findFirst({
      where: {
        period_month: prevMonth,
        period_year: prevYear,
        deleted_at: null,
      },
    });

    const [incomeThisMonth, expensesThismonth] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: {
          type: "income",
          periodMonth: currentMonth,
          periodYear: currentYear,
          deleted_at: null,
        },
        _sum: { amount: true },
      }),

      prisma.cashTransaction.aggregate({
        where: {
          type: "expenses",
          periodMonth: currentMonth,
          periodYear: currentYear,
          deleted_at: null,
        },
        _sum: { amount: true },
      }),
    ]);

    const previousBalance = previousReport
      ? Number(previousReport.closing_balance)
      : 0;
    const income = Number(incomeThisMonth._sum.amount ?? 0);
    const expenses = Number(expensesThismonth._sum.amount ?? 0);
    const closingBalance = previousBalance + income - expenses;

    let uploadedImage: string;
    try {
      uploadedImage = await CloudinaryUtil.uploadStream(
        file.buffer,
        "payments",
      );
    } catch (error) {
      throw new ResponseError(
        StatusCodes.BAD_GATEWAY,
        "Gagal mengunggah bukti rekening koran, silakan coba lagi",
      );
    }

    try {
      const createdReport = await prisma.reports.create({
        data: {
          created_by: body.userId,
          report_proof_img: uploadedImage,
          period_month: currentMonth,
          period_year: currentYear,
          opening_balance: previousBalance,
          total_income: income,
          total_expense: expenses,
          closing_balance: closingBalance,
          last_calculated_at: new Date(),
        },
      });
      const { created_by, ...formattedReports } = createdReport;

      return formattedReports;
    } catch (error) {
      const publicId = CloudinaryUtil.extractPublicId(uploadedImage);
      await CloudinaryUtil.delete([publicId]).catch(() => {});
      throw error;
    }
  }

  static async getAll({ query }: ReportQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.ReportsWhereInput = { deleted_at: null };

    if (query.month) {
      where.period_month = query.month;
    }

    if (query.year) {
      where.period_year = query.year;
    }

    const [reports, totalReports] = await Promise.all([
      prisma.reports.findMany({
        where,
        skip,
        orderBy: { created_at: "desc" },
        include: {
          users_reports_created_byTousers: { select: { name: true } },
          users_reports_approved_byTousers: { select: { name: true } },
        },
      }),
      prisma.reports.count({ where }),
    ]);
    const formattedReports = reports.map((reports) => ({
      id: reports.id,
      report_proof_img: reports.report_proof_img,
      status: reports.status,
      period_month: reports.period_month,
      period_year: reports.period_year,
      opening_balance: reports.opening_balance,
      total_income: reports.total_income,
      total_expense: reports.total_expense,
      closing_balance: reports.closing_balance,
    }));

    return {
      formattedReports,
      meta: {
        page: query.page,
        limit: take,
        totalData: totalReports,
        totalPage: Math.ceil(totalReports / take),
      },
    };
  }

  static async getById({ params }: ReportDetailInput) {
    const findReport = await prisma.reports.findFirst({
      where: { id: params.id, deleted_at: null },
      include: {
        users_reports_created_byTousers: { select: { name: true } },
        users_reports_approved_byTousers: { select: { name: true } },
      },
    });

    if (!findReport)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Laporan keuangan tidak dapat ditemukan.",
      );

    const { created_by, approved_by, ...formattedReports } = findReport;

    return formattedReports;
  }
  static async approval({ params, body }: ReportApprovalInput) {
    const findReport = await prisma.reports.findFirst({
      where: { id: params.id, deleted_at: null },
    });

    if (!findReport)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Laporan keuangan tidak dapat ditemukan.",
      );

    if (findReport.status !== "open")
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Laporan ini sudah di peroses sebelumnya dan tidak dapat diubah kembali.",
      );

    const approvalReports = await prisma.reports.update({
      where: { id: findReport.id },
      data: {
        approved_by: body.status === "closed" ? (body.userId ?? null) : null,
        rejected_reason:
          body.status === "failed" ? (body.rejected_reason ?? null) : null,
        status: body.status,
      },
    });

    const { created_by, approved_by, ...formattedReport } = approvalReports;

    return formattedReport;
  }
  static async delete({ params }: ReportDetailInput) {
    const findReport = await prisma.reports.findFirst({
      where: { id: params.id, deleted_at: null },
    });

    if (!findReport)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Laporan keuangan tidak dapat ditemukan.",
      );

    if (findReport.status !== "open")
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Hanya pengajuan dengan status open yang dapat dihapus",
      );

    await prisma.reports.update({
      where: { id: findReport.id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
