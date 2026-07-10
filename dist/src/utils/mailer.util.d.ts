type SendMail = {
    to: string;
    subject: string;
    html: string;
};
export declare class MailerUtil {
    static sendMail({ to, subject, html }: SendMail): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
}
export {};
//# sourceMappingURL=mailer.util.d.ts.map