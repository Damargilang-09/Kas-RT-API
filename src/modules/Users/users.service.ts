import { StatusCodes } from "http-status-codes";
import { UserRole, UserStatus } from "@prisma/client";
import { AppError } from "../../utils/app-error";
import { UsersRepository } from "./users.repository";
import type {
  GetUsersQuery,
  UpdateUserRequest,
  UpdateUserStatusRequest,
} from "./users.types";

function normalizeGetUsersQuery(query: Record<string, unknown>): GetUsersQuery {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const role = query.role as UserRole | undefined;
  const status = query.status as UserStatus | undefined;

  if (role && !Object.values(UserRole).includes(role)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Role tidak valid");
  }

  if (status && !Object.values(UserStatus).includes(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Status tidak valid");
  }

  return {
    search: query.search ? String(query.search) : undefined,
    role,
    status,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100),
  };
}

export const UsersService = {
  async getAllUsers(query: Record<string, unknown>) {
    const normalizedQuery = normalizeGetUsersQuery(query);
    const { users, total } = await UsersRepository.findAllUsers(normalizedQuery);

    const page = normalizedQuery.page ?? 1;
    const limit = normalizedQuery.limit ?? 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getUserById(id: string) {
    const user = await UsersRepository.findUserById(id);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    return user;
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    const existingUser = await UsersRepository.findUserById(id);

    if (!existingUser) {
      throw new AppError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailOwner = await UsersRepository.findUserByEmail(data.email);

      if (emailOwner && emailOwner.id !== id) {
        throw new AppError(StatusCodes.CONFLICT, "Email sudah digunakan");
      }
    }

    return UsersRepository.updateUser(id, data);
  },

  async updateUserStatus(id: string, data: UpdateUserStatusRequest) {
    const existingUser = await UsersRepository.findUserById(id);

    if (!existingUser) {
      throw new AppError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    return UsersRepository.updateUser(id, {
      status: data.status,
    });
  },

  async deleteUser(id: string) {
    const existingUser = await UsersRepository.findUserById(id);

    if (!existingUser) {
      throw new AppError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    return UsersRepository.softDeleteUser(id);
  },
};
