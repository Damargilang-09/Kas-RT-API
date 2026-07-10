export declare class MailService {
    static sendRegisterWaitingActivation(user: {
        id: string;
        name: string;
        email: string;
    }): Promise<{
        body: string;
        type: import("../../../generated/prisma").$Enums.MailerLogType;
        id: string;
        subject: string;
        emailTo: string;
        referenceId: string | null;
        sentAt: Date | null;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
        deleted_at: Date | null;
        referenceType: import("../../../generated/prisma").$Enums.MailerReferenceType | null;
        status: import("../../../generated/prisma").$Enums.MailerStatus;
        userId: string | null;
    }>;
    static sendAccountActivated(user: {
        id: string;
        name: string;
        email: string;
    }): Promise<{
        body: string;
        type: import("../../../generated/prisma").$Enums.MailerLogType;
        id: string;
        subject: string;
        emailTo: string;
        referenceId: string | null;
        sentAt: Date | null;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
        deleted_at: Date | null;
        referenceType: import("../../../generated/prisma").$Enums.MailerReferenceType | null;
        status: import("../../../generated/prisma").$Enums.MailerStatus;
        userId: string | null;
    }>;
    static buildBillContent(input: {
        name: string;
        billCode: string;
        feeTypeName: string;
        amount: string | number;
        dueDate: Date | string;
    }): {
        subject: string;
        htmlTemplate: string;
    };
    static sendBillFromLog(input: {
        mailerLogId: string;
        to: string;
        subject: string;
        html: string;
    }): Promise<{
        body: string;
        type: import("../../../generated/prisma").$Enums.MailerLogType;
        id: string;
        subject: string;
        emailTo: string;
        referenceId: string | null;
        sentAt: Date | null;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
        deleted_at: Date | null;
        referenceType: import("../../../generated/prisma").$Enums.MailerReferenceType | null;
        status: import("../../../generated/prisma").$Enums.MailerStatus;
        userId: string | null;
    }>;
}
//# sourceMappingURL=mail.service.d.ts.map