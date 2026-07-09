import type {
  UserDetailInput,
  UserListQueryInput,
  UserUpdateInput,
} from "./user.validation";
import { Prisma, UserStatus } from "../../../generated/prisma";
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
      deletedAt: null,
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
      where: { id: params.id, deletedAt: null },
      select: userSafeSelect,
    });

    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "Warga tidak ditemukan!");
    }
    return user;
  }

  static async updateUser({ params, body }: UserUpdateInput) {
    const existingUser = await prisma.user.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingUser) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "User not found!");
    }

    if (body.role) {
      const statusAfterUpdate = body.status ? body.status : existingUser.status;
      if (statusAfterUpdate !== UserStatus.active) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "User must be ACTIVE before role can be changed",
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

      return updatedUser;
    });
//
    const statusBefore = existingUser.status;
    const statusAfter = userAfterUpdate.status;

    const userJustActive =
      statusBefore !== UserStatus.active && statusAfter === UserStatus.active;

    if (userJustActive) {
      await MailService.accountActivated({
        id: userAfterUpdate.id,
        name: userAfterUpdate.name,
        email: userAfterUpdate.email,
      });
    }

    return userAfterUpdate;
  }
}
