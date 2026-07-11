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

  static async sendBillFromLog(input: {
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

      const Updatelog = await prisma.mailerLog.update({
        where: { id: input.mailerLogId },
        data: {
          status: MailerStatus.sent,
          sentAt: new Date(),
          errorMessage: null,
        },
      });

      return Updatelog;
    } catch (error) {
      const err = error as Error;

      const updateLog = await prisma.mailerLog.update({
        where: { id: input.mailerLogId },
        data: { status: MailerStatus.failed, errorMessage: err.message },
      });

      return updateLog;
    }
  }
}
