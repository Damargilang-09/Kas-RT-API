import type {
  GetUserDetailInput,
  GetUserListInput,
  SuperAdminPayload,
  UpdateKetuaRTInput,
} from "./super_admin.validation";
import { prisma } from "../../configs/prisma-client.config";
import { Prisma, UserRole, UserStatus } from "../../../generated/prisma";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";
import { superAdminUserSelect } from "./super_admin.select";
export class SuperAdminService {
  static async getUsers({ query }: GetUserListInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.UserWhereInput = {
      deleted_at: null,
      role: { not: UserRole.superAdmin },
    };

    if (query.search) {
      where.name = { contains: query.search, mode: "insensitive" };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.role) {
      where.role = query.role;
    }

    const totalUser = await prisma.user.count({ where });

    const totalPage = Math.ceil(totalUser / take);

    if (totalUser > 0 && query.page > totalPage) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Page melebihi total halaman!",
      );
    }

    const userList = await prisma.user.findMany({
      where,
      skip,
      take,
      select: superAdminUserSelect,
      orderBy: { createdAt: "desc" },
    });
    const meta = {
      page: query.page,
      limit: take,
      totalData: totalUser,
      totalPage,
    };
    const result = { userList, meta };

    return result;
  }

  static async getUserDetail({ params }: GetUserDetailInput) {
    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        deleted_at: null,
        role: { not: UserRole.superAdmin },
      },
      select: superAdminUserSelect,
    });

    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "User Tidak Ditemukan");
    }

    return user;
  }

  static async updateKetua({
    params,
    payload,
  }: UpdateKetuaRTInput & { payload: SuperAdminPayload }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        deleted_at: null,
        role: { not: UserRole.superAdmin },
      },
    });
    if (!existingUser) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    if (
      existingUser.role === UserRole.ketuaRT &&
      existingUser.status === UserStatus.active
    ) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "User tersebut sudah menjadi Ketua RT aktif",
      );
    }

    const updateUser = await prisma.$transaction(async (tx) => {
      const oldKetuaRT = await tx.user.findFirst({
        where: {
          role: UserRole.ketuaRT,
          deleted_at: null,
          id: { not: existingUser.id },
        },
      });

      if (oldKetuaRT) {
        await tx.user.update({
          where: { id: oldKetuaRT.id },
          data: { role: UserRole.warga },
        });

        await tx.auditLog.create({
          data: {
            userId: payload.id,
            action: "mengubah_ketuaRT_lama_menjadi_warga",
            tableName: "users",
            recordId: oldKetuaRT.id,
            oldValue: { role: oldKetuaRT.role, status: oldKetuaRT.status },
            newValue: { role: UserRole.warga, status: oldKetuaRT.status },
          },
        });
      }

      const newKetuaRT = await tx.user.update({
        where: { id: existingUser.id },
        data: { role: UserRole.ketuaRT, status: UserStatus.active },
        select: superAdminUserSelect,
      });

      await tx.auditLog.create({
        data: {
          userId: payload.id,
          action: "menetapkan_ketuaRT_baru",
          tableName: "users",
          recordId: existingUser.id,
          oldValue: { role: existingUser.role, status: existingUser.status },
          newValue: { role: UserRole.ketuaRT, status: UserStatus.active },
        },
      });

      return newKetuaRT;
    });
    return updateUser;
  }
}
