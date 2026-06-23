import { Prisma } from "@prisma/client";
import { prisma } from "../../configs/prisma-client.config";
import type { GetUsersQuery, UpdateUserRequest } from "./users.types";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  houseNumber: true,
  address: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.UserSelect;

export const UsersRepository = {
  async findAllUsers(query: GetUsersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

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

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
    };
  },

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: safeUserSelect,
    });
  },

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.houseNumber !== undefined) updateData.houseNumber = data.houseNumber;
    if (data.address !== undefined) updateData.address = data.address;

    return prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: safeUserSelect,
    });
  },

  async softDeleteUser(id: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
        deletedAt: new Date(),
      },
      select: safeUserSelect,
    });
  },
};
