import { MailerUtil } from "../../utils/mailer.util";
import { TemplateUtil } from "./templates/utils/template.util";
import { prisma } from "../../configs/prisma-client.config";
import {
  MailerLogType,
  MailerReferenceType,
  MailerStatus,
  Prisma,
} from "../../../generated/prisma";

export class MailService {
  static async sendRegisterWaitingActivation(
    user: {
      id: string;
      name: string;
      email: string;
    },
    tx: Prisma.TransactionClient = prisma,
  ) {
    const subject = "Akun RTku Berhasil Dibuat";
    const htmlTemplate = TemplateUtil.compile("register-waiting-activation", {
      name: user.name,
    });

    const mailerLog = await tx.mailerLog.create({
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

    await MailerUtil.sendMail({
      to: user.email,
      subject: "Akun RTku Berhasil Dibuat",
      html: htmlTemplate,
    });

    await tx.mailerLog.update({
      where: { id: mailerLog.id },
      data: {
        status: MailerStatus.sent,
        sentAt: new Date(),
      },
    });
  }

  static async sendAccountActivated(
    user: {
      id: string;
      name: string;
      email: string;
    },
    tx: Prisma.TransactionClient = prisma,
  ) {
    const subject = "Akun RTku Anda Sudah Aktif";

    const htmlTemplate = TemplateUtil.compile("account-activated", {
      name: user.name,
    });

    const mailerLog = await tx.mailerLog.create({
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

    await MailerUtil.sendMail({
      to: user.email,
      subject: "Akun RTku Anda Sudah Aktif",
      html: htmlTemplate,
    });

    await tx.mailerLog.update({
      where: { id: mailerLog.id },
      data: { status: MailerStatus.sent, sentAt: new Date() },
    });
  }
}
