import { MailerUtil } from "../../utils/mailer.util";
import { TemplateUtil } from "./templates/utils/template.util";
import { prisma } from "../../configs/prisma-client.config";
import {
  MailerLogType,
  MailerReferenceType,
  MailerStatus,
} from "../../../generated/prisma";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";

export class MailService {
  static async sendRegisterWaitingActivation(user: {
    id: string;
    name: string;
    email: string;
  }) {
    const subject = "Akun RTku Berhasil Dibuat";
    const htmlTemplate = TemplateUtil.compile("register-waiting-activation", {
      name: user.name,
    });

    const mailerLog = await prisma.mailerLog.create({
      data: {
        userId: user.id,
        emailTo: user.email,
        subject: subject,
        body: htmlTemplate,
        type: MailerLogType.registration,
        referenceType: MailerReferenceType.user,
        referenceId: user.id,
        status: MailerStatus.pending,
      },
    });

    try {
      await MailerUtil.sendMail({
        to: user.email,
        subject: subject,
        html: htmlTemplate,
      });

      const updateLog = await prisma.mailerLog.update({
        where: { id: mailerLog.id },
        data: { status: MailerStatus.sent, sentAt: new Date() },
      });

      return updateLog;
    } catch (error) {
      const err = error as Error;

      await prisma.mailerLog.update({
        where: { id: mailerLog.id },
        data: {
          status: MailerStatus.failed,
          errorMessage: err.message,
        },
      });

      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Gagal mengirim email registrasi",
      );
    }
  }

  static async sendAccountActivated(user: {
    id: string;
    name: string;
    email: string;
  }) {
    const subject = "Akun RTku Anda Sudah Aktif";
    const htmlTemplate = TemplateUtil.compile("account-activated", {
      name: user.name,
    });

    const mailerLog = await prisma.mailerLog.create({
      data: {
        userId: user.id,
        emailTo: user.email,
        subject: subject,
        body: htmlTemplate,
        type: MailerLogType.activation,
        referenceType: MailerReferenceType.user,
        referenceId: user.id,
        status: MailerStatus.pending,
      },
    });

    try {
      await MailerUtil.sendMail({
        to: user.email,
        subject: subject,
        html: htmlTemplate,
      });

      const updateLog = await prisma.mailerLog.update({
        where: { id: mailerLog.id },
        data: { status: MailerStatus.sent, sentAt: new Date() },
      });

      return updateLog;
    } catch (error) {
      const err = error as Error;

      await prisma.mailerLog.update({
        where: { id: mailerLog.id },
        data: {
          status: MailerStatus.failed,
          errorMessage: err.message,
        },
      });

      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Gagal mengirim email aktivasi akun",
      );
    }
  }

  static buildBillContent(input: {
    name: string;
    billCode: string;
    feeTypeName: string;
    amount: string | number;
    dueDate: Date | string;
  }) {
    const subject = `Tagihan Baru RTku - ${input.billCode}`;

    const htmlTemplate = TemplateUtil.compile("generate-bill", {
      name: input.name,
      billCode: input.billCode,
      feeTypeName: input.feeTypeName,
      amount: input.amount,
      dueDate: input.dueDate,
    });

    const content = { subject, htmlTemplate };
    return content;
  }

  // ---------------------------------------------------------------------
  // Payment approved / rejected
  // ---------------------------------------------------------------------
  static buildPaymentApprovedContent(input: {
    name: string;
    billCode: string;
    feeTypeName: string;
    amount: string | number;
    paidAt: Date | string;
  }) {
    const subject = `Pembayaran Dikonfirmasi - ${input.billCode}`;

    const htmlTemplate = TemplateUtil.compile("payment-approved", {
      name: input.name,
      billCode: input.billCode,
      feeTypeName: input.feeTypeName,
      amount: input.amount,
      paidAt: input.paidAt,
    });

    return { subject, htmlTemplate };
  }

  static buildPaymentRejectedContent(input: {
    name: string;
    billCode: string;
    feeTypeName: string;
    amount: string | number;
    rejectedReason: string;
  }) {
    const subject = `Pembayaran Ditolak - ${input.billCode}`;

    const htmlTemplate = TemplateUtil.compile("payment-rejected", {
      name: input.name,
      billCode: input.billCode,
      feeTypeName: input.feeTypeName,
      amount: input.amount,
      rejectedReason: input.rejectedReason,
    });

    return { subject, htmlTemplate };
  }

  // ---------------------------------------------------------------------
  // Generic sender: kirim email dari sebuah mailerLog yang sudah dibuat
  // (status pending), lalu update status jadi sent/failed. Dipakai lintas
  // modul (bill, payment, dll) supaya tidak duplikasi logic kirim + update.
  // ---------------------------------------------------------------------
  static async sendFromLog(input: {
    mailerLogId: string;
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      await MailerUtil.sendMail({
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      const updateLog = await prisma.mailerLog.update({
        where: { id: input.mailerLogId },
        data: {
          status: MailerStatus.sent,
          sentAt: new Date(),
          errorMessage: null,
        },
      });

      return updateLog;
    } catch (error) {
      const err = error as Error;

      const updateLog = await prisma.mailerLog.update({
        where: { id: input.mailerLogId },
        data: { status: MailerStatus.failed, errorMessage: err.message },
      });

      return updateLog;
    }
  }

  // Dipertahankan supaya bill.service.ts yang sudah ada tetap jalan tanpa
  // perubahan; secara internal cuma mendelegasikan ke sendFromLog.
  static async sendBillFromLog(input: {
    mailerLogId: string;
    to: string;
    subject: string;
    html: string;
  }) {
    return MailService.sendFromLog(input);
  }
}