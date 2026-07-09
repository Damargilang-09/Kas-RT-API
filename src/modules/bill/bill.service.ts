import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.util";
import { Prisma } from "../../../generated/prisma";
import { makeBillCode } from "./bill.helper";
import type { BillListQueryInput, GenerateBillInput } from "./bill.validation";
import {
  BillingPeriod,
  BillStatus,
  MailerLogType,
  MailerReferenceType,
  MailerStatus,
  UserRole,
  UserStatus,
} from "../../../generated/prisma";
import { billSelect } from "./bill.select";
import { MailService } from "../mail/mail.service";

type BillPayLoad = { id: string; role: string };
export class BillService {
  static async generateBill({
    body,
    payload,
  }: GenerateBillInput & { payload: BillPayLoad }) {
    const feeType = await prisma.feeType.findFirst({
      where: { id: body.feeTypeId, deletedAt: null },
    });

    if (!feeType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis Tagihan Tidak Ditemukan",
      );
    }

    if (
      feeType.billingPeriod === BillingPeriod.monthly &&
      (!body.periodMonth || !body.periodYear)
    ) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Bulan dan Tahun Periode Wajib untuk Iuran Bulanan",
      );
    }

    const periodMonth =
      feeType.billingPeriod === BillingPeriod.once
        ? null
        : (body.periodMonth ?? null);

    const periodYear =
      feeType.billingPeriod === BillingPeriod.once
        ? null
        : (body.periodYear ?? null);

    const targetUsers = await prisma.user.findMany({
      where: {
        status: UserStatus.active,
        deletedAt: null,
        role: { in: [UserRole.warga, UserRole.bendahara, UserRole.ketuaRT] },
      },
      select: { id: true, name: true, email: true },
    });
    // step 1 nya kita buat $transaction bill ama mail pendingdulu. belom kirim email, supaya pastiin bill kebuat dulu
    // baru kirim email.

    const createdItems = await prisma.$transaction(async (tx) => {
      const result = [];
      let billNumber = 1;

      for (const user of targetUsers) {
        const existingBill = await tx.bill.findFirst({
          where: {
            feeTypeId: feeType.id,
            userId: user.id,
            periodMonth,
            periodYear,
            deletedAt: null,
          },
        });
        if (existingBill) {
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
            billCode: billCode,
            amount: feeType.amount,
            periodMonth,
            periodYear,
            dueDate: body.dueDate,
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
          select: { id: true, emailTo: true, subject: true, body: true },
        });
        result.push({ bill, mailerLog });
        billNumber += 1;
      }
      return result;
    });

    // stepp 2, ini kirim email satu satu makanya pake looping
    const bills = createdItems.map((item) => item.bill);

    await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: "generate_bills",
        tableName: "bills",
        recordId: null,
        oldValue: Prisma.DbNull,
        newValue: {
          feeTypeId: feeType.id,
          feeTypeName: feeType.name,
          billingPeriod: feeType.billingPeriod,
          periodMonth,
          periodYear,
          dueDate: body.dueDate,
          targetUserCount: targetUsers.length,
          createdBillCount: bills.length,
          createdBillIds: bills.map((bill) => bill.id),
        },
      },
    });

    for (const item of createdItems) {
      await MailService.sendBillFromLog({
        mailerLogId: item.mailerLog.id,
        to: item.mailerLog.emailTo,
        subject: item.mailerLog.subject,
        html: item.mailerLog.body,
      });
    }

    return bills;
  }

  static async getBills({ query }: BillListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.BillWhereInput = { deletedAt: null };

    if (query.status) {
      where.status = query.status;
    }
    if (query.feeTypeId) {
      where.feeTypeId = query.feeTypeId;
    }
    if (query.periodMonth) {
      where.periodMonth = query.periodMonth;
    }
    if (query.periodYear) {
      where.periodYear = query.periodYear;
    }

    const getBills = await prisma.bill.findMany({
      where,
      skip,
      take,
      select: billSelect,
      orderBy: { createdAt: "asc" },
    });

    const totalData = await prisma.bill.count({ where });
    const totalPage = Math.ceil(totalData / take);

    const meta = {
      page: query.page,
      limit: take,
      totalData,
      totalPage,
    };
    const result = { getBills, meta };
    
    return result
  }
}
