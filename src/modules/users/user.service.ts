import type {
  UserDeleteInput,
  UserDetailInput,
  UserListQueryInput,
  UserUpdateInput,
} from "./user.validation";
import { Prisma, UserRole, UserStatus } from "../../../generated/prisma";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";
import { userSafeSelect } from "./user.select";
import { MailService } from "../mail/mail.service";

/*
endpointnya GET "/users"
tugasnya nampilin semua warga , batesan hanya deletedAt=nu;;
status & role dipakai sebagai filter opsional.
*/

export class UserService {
  static async getUsers({ query }: UserListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.UserWhereInput = {
      deleted_at: null,
      role: { in: [UserRole.bendahara, UserRole.warga] },
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

    const totalUser = await prisma.user.count({ where });
    const totalPage = Math.ceil(totalUser / take);

    if (totalUser > 0 && query.page > totalPage) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Page melebihi total halaman!",
      );
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      select: userSafeSelect,
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
  }

  /* 

GET "/:id"
ketika pak RT klik salah satu akun,
tugas service ini nampilin detail akun .
search dan lainnya sama kek di List.

*/

  static async getUserDetail({ params }: UserDetailInput) {
    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        deleted_at: null,
        role: { in: [UserRole.bendahara, UserRole.warga] },
      },
      select: userSafeSelect,
    });

    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "Warga tidak ditemukan!");
    }
    return user;
  }

  static async updateUser({
    params,
    body,
    payload,
  }: UserUpdateInput & { payload: { id: string } }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        deleted_at: null,
        role: { in: [UserRole.bendahara, UserRole.warga] },
      },
    });

    if (!existingUser) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "User tidak ditemukan!");
    }

    if (body.role) {
      const statusAfterUpdate = body.status ? body.status : existingUser.status;
      if (statusAfterUpdate !== UserStatus.active) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "User harus aktif terlebih dahulu agar role bisa diubah!",
        );
      }
    }
    //
    const updateData: Prisma.UserUpdateInput = {};

    if (body.status) {
      updateData.status = body.status;
    }
    if (body.role) {
      updateData.role = body.role;
    }

    const userAfterUpdate = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: params.id },
        data: updateData,
        select: userSafeSelect,
      });

      await tx.auditLog.create({
        data: {
          userId: payload.id,
          action: "update_user",
          tableName: "users",
          recordId: existingUser.id,
          oldValue: {
            role: existingUser.role,
            status: existingUser.status,
          },
          newValue: {
            role: updatedUser.role,
            status: updatedUser.status,
          },
        },
      });

      return updatedUser;
    });
    //
    const statusBefore = existingUser.status;
    const statusAfter = userAfterUpdate.status;

    const userJustActive =
      statusBefore !== UserStatus.active && statusAfter === UserStatus.active;

    if (userJustActive) {
      await MailService.sendAccountActivated({
        id: userAfterUpdate.id,
        name: userAfterUpdate.name,
        email: userAfterUpdate.email,
      });
    }

    return userAfterUpdate;
  }

  static async deleteUser({
    params,
    payload,
  }: UserDeleteInput & { payload: { id: string } }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        deleted_at: null,
        role: { in: [UserRole.warga, UserRole.bendahara] },
      },
    });

    if (!existingUser) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    const deletedAt = new Date();
    const roleAfterDelete =
      existingUser.role === UserRole.bendahara
        ? UserRole.warga
        : existingUser.role;

    const deletedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          deleted_at: deletedAt,
          status: UserStatus.inactive,
          role: roleAfterDelete,
        },
        select: userSafeSelect,
      });

      await tx.auditLog.create({
        data: {
          userId: payload.id,
          action: "soft_delete_user",
          tableName: "users",
          recordId: existingUser.id,
          oldValue: {
            role: existingUser.role,
            status: existingUser.status,
            deletedAt: null,
          },
          newValue: {
            role: roleAfterDelete,
            status: UserStatus.inactive,
            deletedAt: deletedAt,
          },
        },
      });
      return user;
    });
    return deletedUser;
  }
}
