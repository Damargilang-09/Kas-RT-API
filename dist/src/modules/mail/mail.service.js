"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const mailer_util_1 = require("../../utils/mailer.util");
const template_util_1 = require("./templates/utils/template.util");
const prisma_client_config_1 = require("../../configs/prisma-client.config");
const prisma_1 = require("../../../generated/prisma");
const response_error_util_1 = require("../../utils/response-error.util");
const http_status_codes_1 = require("http-status-codes");
class MailService {
    static sendRegisterWaitingActivation(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = "Akun RTku Berhasil Dibuat";
            const htmlTemplate = template_util_1.TemplateUtil.compile("register-waiting-activation", {
                name: user.name,
            });
            const mailerLog = yield prisma_client_config_1.prisma.mailerLog.create({
                data: {
                    userId: user.id,
                    emailTo: user.email,
                    subject: subject,
                    body: htmlTemplate,
                    type: prisma_1.MailerLogType.registration,
                    referenceType: prisma_1.MailerReferenceType.user,
                    referenceId: user.id,
                    status: prisma_1.MailerStatus.pending,
                },
            });
            try {
                yield mailer_util_1.MailerUtil.sendMail({
                    to: user.email,
                    subject: subject,
                    html: htmlTemplate,
                });
                const updateLog = yield prisma_client_config_1.prisma.mailerLog.update({
                    where: { id: mailerLog.id },
                    data: { status: prisma_1.MailerStatus.sent, sentAt: new Date() },
                });
                return updateLog;
            }
            catch (error) {
                const err = error;
                yield prisma_client_config_1.prisma.mailerLog.update({
                    where: { id: mailerLog.id },
                    data: {
                        status: prisma_1.MailerStatus.failed,
                        errorMessage: err.message,
                    },
                });
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Gagal mengirim email registrasi");
            }
        });
    }
    static sendAccountActivated(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = "Akun RTku Anda Sudah Aktif";
            const htmlTemplate = template_util_1.TemplateUtil.compile("account-activated", {
                name: user.name,
            });
            const mailerLog = yield prisma_client_config_1.prisma.mailerLog.create({
                data: {
                    userId: user.id,
                    emailTo: user.email,
                    subject: subject,
                    body: htmlTemplate,
                    type: prisma_1.MailerLogType.activation,
                    referenceType: prisma_1.MailerReferenceType.user,
                    referenceId: user.id,
                    status: prisma_1.MailerStatus.pending,
                },
            });
            try {
                yield mailer_util_1.MailerUtil.sendMail({
                    to: user.email,
                    subject: subject,
                    html: htmlTemplate,
                });
                const updateLog = yield prisma_client_config_1.prisma.mailerLog.update({
                    where: { id: mailerLog.id },
                    data: { status: prisma_1.MailerStatus.sent, sentAt: new Date() },
                });
                return updateLog;
            }
            catch (error) {
                const err = error;
                yield prisma_client_config_1.prisma.mailerLog.update({
                    where: { id: mailerLog.id },
                    data: {
                        status: prisma_1.MailerStatus.failed,
                        errorMessage: err.message,
                    },
                });
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Gagal mengirim email aktivasi akun");
            }
        });
    }
    static buildBillContent(input) {
        const subject = `Tagihan Baru RTku - ${input.billCode}`;
        const htmlTemplate = template_util_1.TemplateUtil.compile("generate-bill", {
            name: input.name,
            billCode: input.billCode,
            feeTypeName: input.feeTypeName,
            amount: input.amount,
            dueDate: input.dueDate,
        });
        const content = { subject, htmlTemplate };
        return content;
    }
    static sendBillFromLog(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield mailer_util_1.MailerUtil.sendMail({
                    to: input.to,
                    subject: input.subject,
                    html: input.html,
                });
                const Updatelog = yield prisma_client_config_1.prisma.mailerLog.update({
                    where: { id: input.mailerLogId },
                    data: {
                        status: prisma_1.MailerStatus.sent,
                        sentAt: new Date(),
                        errorMessage: null,
                    },
                });
                return Updatelog;
            }
            catch (error) {
                const err = error;
                const updateLog = yield prisma_client_config_1.prisma.mailerLog.update({
                    where: { id: input.mailerLogId },
                    data: { status: prisma_1.MailerStatus.failed, errorMessage: err.message },
                });
                return updateLog;
            }
        });
    }
}
exports.MailService = MailService;
//# sourceMappingURL=mail.service.js.map