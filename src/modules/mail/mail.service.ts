import { MailerUtil } from "../../utils/mailer.util";
import { TemplateUtil } from "./templates/utils/template.util";

export class MailService {
  static async sendRegisterWaitingActivation(user: {
    name: string;
    email: string;
  }) {
    const htmlTemplate = TemplateUtil.compile("register-waiting-activation", {
      name: user.name,
    });

    await MailerUtil.sendMail({
      to: user.email,
      subject: "Akun RTku Berhasil Dibuat",
      html: htmlTemplate,
    });
  }

  static async sendAccountActivated(user: { name: string; email: string }) {
    const htmlTemplate = TemplateUtil.compile("account-activated", {
      name: user.name,
    });

    await MailerUtil.sendMail({
      to: user.email,
      subject: "Akun RTku Anda Sudah Aktif",
      html: htmlTemplate,
    });
  }
}
