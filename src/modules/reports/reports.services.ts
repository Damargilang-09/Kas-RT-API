import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { CloudinaryUtil } from "../../utils/cloudinary.utils";
import { getCurrentPeriod, getPreviousPeriod } from "../../utils/date.utils";
import { ResponseError } from "../../utils/response-error.util";
import {
  ReportApprovalInput,
  ReportDetailInput,
  ReportQueryInput,
} from "./reports.validation";
import { Prisma } from "../../../generated/prisma";
import { userPayload } from "../../validations/queryValidation";
import { AuditLogUtil } from "../../utils/auditLog.utils";

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

  static async create(file: Express.Multer.File, payload: userPayload) {
    const { month: currentMonth, year: currentYear } = getCurrentPeriod();

    const findReport = await prisma.reports.findFirst({
      where: {
        period_month: currentMonth,
        period_year: currentYear,
      },
    });

    if (findReport)
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Anda sudah melakukan pengajuan closing balance pada bulan ini.",
      );

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
          created_by: payload.id,
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

      await AuditLogUtil.record({
        userId: payload.id,
        action: "CREATE_REPORTS",
        tableName: "reports",
        recordId: createdReport.id,
        oldValue: null,
        newValue: {
          opening_balance: createdReport,
          total_income: createdReport,
          total_expense: createdReport,
          closing_balance: createdReport,
          status: createdReport.status,
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
        take,
        orderBy: {
          created_at: "desc",
        },
        include: {
          users_reports_created_byTousers: {
            select: {
              name: true,
            },
          },

          users_reports_approved_byTousers: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.reports.count({ where }),
    ]);

    return {
      reports,
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
  static async approval(
    { params, body }: ReportApprovalInput,
    payload: userPayload,
  ) {
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
        approved_by: payload.id,
        rejected_reason:
          body.status === "failed" ? (body.rejected_reason ?? null) : null,
        status: body.status,
      },
    });

    await AuditLogUtil.record({
      userId: payload.id,
      action: body.status === "closed" ? "CLOSED_REPORTS" : "FAILED_REPORTS",
      tableName: "reports",
      recordId: findReport.id,
      oldValue: { status: "open" },
      newValue: {
        status: body.status,
        rejectedreason: body.rejected_reason ?? null,
      },
    });

    const { created_by, approved_by, ...formattedReport } = approvalReports;

    return formattedReport;
  }

  static async resubmission(
    { params }: ReportDetailInput,
    payload: userPayload,
    file: Express.Multer.File,
  ) {
    const findReport = await prisma.reports.findFirst({
      where: {
        id: params.id,
        status: "failed",
      },
    });

    if (!findReport) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Laporan keuangan tidak ditemukan.",
      );
    }

    let uploadedImage: string | undefined;

    try {
      uploadedImage = await CloudinaryUtil.uploadStream(
        file.buffer,
        "payments",
      );

      const resubmission = await prisma.reports.update({
        where: {
          id: findReport.id,
        },
        data: {
          report_proof_img: uploadedImage,
          status: "open",
        },
      });

      if (findReport.report_proof_img) {
        const publicId = CloudinaryUtil.extractPublicId(
          findReport.report_proof_img,
        );

        await CloudinaryUtil.delete([publicId]).catch((err) => {
          console.error("Failed to delete old report image:", err);
        });
      }

      await AuditLogUtil.record({
        userId: payload.id,
        action: "RESUBMIT_REPORT",
        tableName: "reports",
        recordId: resubmission.id,
        oldValue: {
          status: findReport.status,
          report_proof_img: findReport.report_proof_img,
        },
        newValue: {
          status: resubmission.status,
          report_proof_img: uploadedImage,
        },
      }).catch((err) => {
        console.error("Failed to create audit log:", err);
      });

      const { created_by, approved_by, ...formattedReports } = resubmission;

      return formattedReports;
    } catch (error) {
      if (uploadedImage) {
        const publicId = CloudinaryUtil.extractPublicId(uploadedImage);

        await CloudinaryUtil.delete([publicId]).catch(() => {});
      }

      if (error instanceof ResponseError) {
        throw error;
      }

      throw error;
    }
  }
}
//   static async delete({ params }: ReportDetailInput, payload: userPayload) {
//     const findReport = await prisma.reports.findFirst({
//       where: { id: params.id, deleted_at: null },
//     });

//     if (!findReport)
//       throw new ResponseError(
//         StatusCodes.NOT_FOUND,
//         "Laporan keuangan tidak dapat ditemukan.",
//       );

//     if (findReport.status !== "open")
//       throw new ResponseError(
//         StatusCodes.NOT_FOUND,
//         "Hanya pengajuan dengan status open yang dapat dihapus",
//       );

//     await prisma.reports.update({
//       where: { id: findReport.id },
//       data: {
//         deleted_at: new Date(),
//       },
//     });

//     await AuditLogUtil.record({
//       userId: payload.id,
//       action: "DELETE_REPORT",
//       tableName: "income",
//       recordId: findReport.id,
//       oldValue: { deleted_at: null },
//       newValue: { deleted_at: new Date().toISOString() },
//     });
//   }
// }
