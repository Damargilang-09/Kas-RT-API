import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.util";
import {
  BillingPeriod,
  BillStatus,
  MailerLogType,
  MailerReferenceType,
  MailerStatus,
  Prisma,
  UserRole,
  UserStatus,
} from "../../../generated/prisma";
import {
  makeBillBatchId,
  makeBillCode,
  calculateMonthlyDueDate,
} from "./bill.helper";
import { billSelect, myBillDetailSelect } from "./bill.select";
import { MailService } from "../mail/mail.service";
import type {
  BillDetailInput,
  BillListQueryInput,
  BillPayload,
  CancelBatchBillInput,
  GenerateBillInput,
  MyBillDetailInput,
  MyBillListQueryInput,
} from "./bill.validation";

export class BillService {
  static async getFeeTypeForGenerate(feeTypeId: string) {
    const feeType = await prisma.feeType.findFirst({
      where: { id: feeTypeId, deleted_at: null },
    });

    if (!feeType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis Tagihan Tidak Ditemukan!",
      );
    }

    return feeType;
  }

  // Function GenerateBILL
  static async generateBill({
    body,
    payload,
  }: GenerateBillInput & { payload: BillPayload }) {
    const feeType = await BillService.getFeeTypeForGenerate(body.feeTypeId);

    let dueDate: Date;

    if (feeType.billingPeriod === BillingPeriod.monthly) {
      if (!body.periodMonth || !body.periodYear) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "BUlan dan Tahun Periode Wajib untuk Iuran Bulanan",
        );
      }

      if (feeType.dueDay === null) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Tanggal jatuh tempo pada iuran bulanan belum ditentukan",
        );
      }

      dueDate = calculateMonthlyDueDate({
        periodMonth: body.periodMonth,
        periodYear: body.periodYear,
        dueDay: feeType.dueDay,
      });
    } else {
      if (!body.dueDate) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Tanggal jatuh tempo wajib diisi untuk iuran sekali bayar",
        );
      }

      dueDate = body.dueDate;
    }

    const periodMonth =
      feeType.billingPeriod === BillingPeriod.once
        ? null
        : (body.periodMonth ?? null);

    const periodYear =
      feeType.billingPeriod === BillingPeriod.once
        ? null
        : (body.periodYear ?? null);

    const batchId = makeBillBatchId({
      periodYear,
      periodMonth,
      feeTypeId: feeType.id,
    });

    const targetUsers = await prisma.user.findMany({
      where: {
        status: UserStatus.active,
        deleted_at: null,
        role: { in: [UserRole.warga, UserRole.bendahara, UserRole.ketuaRT] },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const createdItems = await prisma.$transaction(
      async (tx) => {
        const result = [];
        let billNumber = 1;
        let skippedDuplicateCount = 0;

        for (const user of targetUsers) {
          const existingBill = await tx.bill.findFirst({
            where: {
              feeTypeId: feeType.id,
              userId: user.id,
              periodMonth,
              periodYear,
              deleted_at: null,
            },
          });

          if (existingBill) {
            skippedDuplicateCount += 1;
            continue;
          }

          const billCode = makeBillCode({
            periodYear,
            periodMonth,
            feeTypeId: feeType.id,
            billNumber,
          });

          const bill = await tx.bill.create({
            data: {
              feeTypeId: feeType.id,
              userId: user.id,
              billCode,
              batchId,
              amount: feeType.amount,
              periodMonth,
              periodYear,
              dueDate,
              status: BillStatus.unpaid,
            },
            select: billSelect,
          });

          const mailContent = MailService.buildBillContent({
            name: user.name,
            billCode: bill.billCode,
            feeTypeName: bill.feeType.name,
            amount: String(bill.amount),
            dueDate: bill.dueDate,
          });

          const mailerLog = await tx.mailerLog.create({
            data: {
              userId: user.id,
              emailTo: user.email,
              subject: mailContent.subject,
              body: mailContent.htmlTemplate,
              type: MailerLogType.bill_created,
              referenceType: MailerReferenceType.bill,
              referenceId: bill.id,
              status: MailerStatus.pending,
            },
            select: {
              id: true,
              emailTo: true,
              subject: true,
              body: true,
            },
          });

          result.push({ bill, mailerLog });
          billNumber += 1;
        }

        return { items: result, skippedDuplicateCount };
      },
      { maxWait: 10000, timeout: 30000 },
    );

    if (createdItems.items.length === 0) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Tidak ada tagihan baru yang dibuat. Semua target user sudah memiliki tagihan untuk periode ini",
      );
    }

    const bills = createdItems.items.map((item) => item.bill);

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: "generate_bills",
        tableName: "bills",
        recordId: null,
        newValue: {
          batchId,
          feeTypeId: feeType.id,
          feeTypeName: feeType.name,
          billingPeriod: feeType.billingPeriod,
          periodMonth,
          periodYear,
          dueDate: dueDate.toISOString(),
          targetUserCount: targetUsers.length,
          createdBillCount: bills.length,
          skippedDuplicateCount: createdItems.skippedDuplicateCount,
          createdBillIds: bills.map((bill) => bill.id),
        },
      },
    });

    for (const item of createdItems.items) {
      await MailService.sendBillFromLog({
        mailerLogId: item.mailerLog.id,
        to: item.mailerLog.emailTo,
        subject: item.mailerLog.subject,
        html: item.mailerLog.body,
      });
    }

    return { batchId, bills, auditLogId: auditLog.id };
  }

  // Function GetBills
  static async getBills({ query }: BillListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.BillWhereInput = {
      deleted_at: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.feeTypeId) {
      where.feeTypeId = query.feeTypeId;
    }

    if (query.batchId) {
      where.batchId = query.batchId;
    }

    if (query.periodMonth) {
      where.periodMonth = query.periodMonth;
    }

    if (query.periodYear) {
      where.periodYear = query.periodYear;
    }

    if (query.search) {
      where.OR = [
        {
          billCode: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          batchId: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            houseNumber: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
        {
          feeType: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [bills, totalData] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take,
        select: billSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.bill.count({
        where,
      }),
    ]);

    return {
      bills,
      meta: {
        page: query.page,
        limit: take,
        totalData,
        totalPage: Math.max(1, Math.ceil(totalData / take)),
      },
    };
  }

  // Function ini untuk ambil detail tagihan.
  static async getBillDetail({ params }: BillDetailInput) {
    const bill = await prisma.bill.findFirst({
      where: {
        id: params.id,
        deleted_at: null,
      },
      select: billSelect,
    });

    if (!bill) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "Tagihan Tidak Ditemukan");
    }

    return bill;
  }

  // Function untuk cancel Bill Batch

  static async cancelBillBatch({
    body,
    payload,
  }: CancelBatchBillInput & { payload: BillPayload }) {
    const billsInBatch = await prisma.bill.findMany({
      where: {
        batchId: body.batchId,
        deleted_at: null,
      },
      select: {
        id: true,
        billCode: true,
        batchId: true,
        userId: true,
        status: true,
        feeTypeId: true,
        periodMonth: true,
        periodYear: true,
      },
    });

    if (billsInBatch.length === 0) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Batch Tagihan Tidak Ditemukan",
      );
    }
    const cancellableStatuses: BillStatus[] = [
      BillStatus.unpaid,
      BillStatus.overdue,
    ];

    const cancellableBills = billsInBatch.filter((bill) =>
      cancellableStatuses.includes(bill.status),
    );

    const paidBills = billsInBatch.filter(
      (bill) => bill.status === BillStatus.paid,
    );

    const pendingBills = billsInBatch.filter(
      (bill) => bill.status === BillStatus.pending,
    );

    const alreadyCancelledBills = billsInBatch.filter(
      (bill) => bill.status === BillStatus.cancelled,
    );

    if (cancellableBills.length === 0) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Tidak ada tagihan yang bisa dibatalkan. Semua tagihan sudah paid, pending, atau cancelled.",
      );
    }

    const cancelledBills = await prisma.bill.updateMany({
      where: {
        id: {
          in: cancellableBills.map((bill) => bill.id),
        },
      },
      data: {
        status: BillStatus.cancelled,
      },
    });

    const result = {
      batchId: body.batchId,
      totalBillInBatch: billsInBatch.length,
      cancelledCount: cancelledBills.count,
      paidSkippedCount: paidBills.length,
      pendingSkippedCount: pendingBills.length,
      alreadyCancelledCount: alreadyCancelledBills.length,
      cancelledBillIds: cancellableBills.map((bill) => bill.id),
      paidSkippedBillIds: paidBills.map((bill) => bill.id),
      pendingSkippedBillIds: pendingBills.map((bill) => bill.id),
      alreadyCancelledBillIds: alreadyCancelledBills.map((bill) => bill.id),
    };

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: "cancel_batch_bills",
        tableName: "bills",
        recordId: null,
        newValue: result,
      },
    });

    const response = {
      ...result,
      auditLogId: auditLog.id,
    };

    return response;
  }

  // Function untuk lihat my-bills
  static async getMyBills({
    payload,
    query,
  }: {
    payload: BillPayload;
    query: MyBillListQueryInput["query"];
  }) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

  
    const usePagination = query.status !== undefined;

    const where: Prisma.BillWhereInput = {
      userId: payload.id,
      deleted_at: null,
      status: { not: BillStatus.paid },
    };

    // Tab "Semua" di tagihan saya
    if (query.status === "all" || query.status === "active") {
      where.status = {
        in: [BillStatus.unpaid, BillStatus.overdue],
      };
    }

    if (query.status === "pending") {
      where.status = BillStatus.pending;
    }

    const summaryWhere: Prisma.BillWhereInput = {
      userId: payload.id,
      deleted_at: null,
    };

    const [bills, totalData, activeSummary, pendingCount] = await Promise.all([
      prisma.bill.findMany({
        where,
        ...(usePagination ? { skip, take } : {}),
        select: billSelect,
        orderBy: { dueDate: "desc" },
      }),
      prisma.bill.count({ where }),
      prisma.bill.aggregate({
        where: {
          ...summaryWhere,
          status: { in: [BillStatus.unpaid, BillStatus.overdue] },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.bill.count({
        where: {
          ...summaryWhere,
          status: BillStatus.pending,
        },
      }),
    ]);

    return {
      bills,
      meta: {
        page: usePagination ? query.page : 1,
        limit: usePagination ? take : totalData,
        totalData,
        totalPage: usePagination
          ? Math.max(1, Math.ceil(totalData / take))
          : 1,
      },
      summary: {
        totalDue: Number(activeSummary._sum.amount ?? 0),
        activeCount: activeSummary._count.id,
        pendingCount,
      },
    };
  }

  static async getMyBillDetail({
    params,
    payload,
  }: MyBillDetailInput & { payload: BillPayload }) {
    const myBillDetail = await prisma.bill.findFirst({
      where: { id: params.id, userId: payload.id, deleted_at: null },
      select: myBillDetailSelect,
    });

    if (!myBillDetail) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Bill Tagihan Tidak Ditemukan",
      );
    }
    return myBillDetail;
  }
}
