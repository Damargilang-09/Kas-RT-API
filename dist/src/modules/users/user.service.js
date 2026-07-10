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
exports.UserService = void 0;
const prisma_1 = require("../../../generated/prisma");
const prisma_client_config_1 = require("../../configs/prisma-client.config");
const response_error_util_1 = require("../../utils/response-error.util");
const http_status_codes_1 = require("http-status-codes");
const user_select_1 = require("./user.select");
const mail_service_1 = require("../mail/mail.service");
/*
endpointnya GET "/users"
tugasnya nampilin semua warga , batesan hanya deletedAt=nu;;
status & role dipakai sebagai filter opsional.
*/
class UserService {
    static getUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query }) {
            const skip = (query.page - 1) * query.limit;
            const take = query.limit;
            const where = {
                deleted_at: null,
            };
            if (query.search) {
                where.OR = [
                    {
                        name: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },
                    {
                        houseNumber: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },
                ];
            }
            if (query.role) {
                where.role = query.role;
            }
            if (query.status) {
                where.status = query.status;
            }
            const totalUser = yield prisma_client_config_1.prisma.user.count({ where });
            const totalPage = Math.ceil(totalUser / take);
            if (totalUser > 0 && query.page > totalPage) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Page melebihi total halaman!");
            }
            const users = yield prisma_client_config_1.prisma.user.findMany({
                where,
                skip,
                take,
                select: user_select_1.userSafeSelect,
                orderBy: [{ status: "desc" }, { createdAt: "asc" }],
            });
            const result = {
                users,
                meta: {
                    page: query.page,
                    totalData: totalUser,
                    totalPage,
                },
            };
            return result;
        });
    }
    /*
  
  GET "/:id"
  ketika pak RT klik salah satu akun,
  tugas service ini nampilin detail akun .
  search dan lainnya sama kek di List.
  
  */
    static getUserDetail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params }) {
            const user = yield prisma_client_config_1.prisma.user.findFirst({
                where: { id: params.id, deletedAt: null },
                select: user_select_1.userSafeSelect,
            });
            if (!user) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "Warga tidak ditemukan!");
            }
            return user;
        });
    }
    static updateUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params, body }) {
            const existingUser = yield prisma_client_config_1.prisma.user.findFirst({
                where: { id: params.id, deletedAt: null },
            });
            if (!existingUser) {
                throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found!");
            }
            if (body.role) {
                const statusAfterUpdate = body.status ? body.status : existingUser.status;
                if (statusAfterUpdate !== prisma_1.UserStatus.active) {
                    throw new response_error_util_1.ResponseError(http_status_codes_1.StatusCodes.BAD_REQUEST, "User must be ACTIVE before role can be changed");
                }
            }
            //
            const updateData = {};
            if (body.status) {
                updateData.status = body.status;
            }
            if (body.role) {
                updateData.role = body.role;
            }
            const userAfterUpdate = yield prisma_client_config_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedUser = yield tx.user.update({
                    where: { id: params.id },
                    data: updateData,
                    select: user_select_1.userSafeSelect,
                });
                return updatedUser;
            }));
            //
            const statusBefore = existingUser.status;
            const statusAfter = userAfterUpdate.status;
            const userJustActive = statusBefore !== prisma_1.UserStatus.active && statusAfter === prisma_1.UserStatus.active;
            if (userJustActive) {
                yield mail_service_1.MailService.sendAccountActivated({
                    id: userAfterUpdate.id,
                    name: userAfterUpdate.name,
                    email: userAfterUpdate.email,
                });
            }
            return userAfterUpdate;
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map