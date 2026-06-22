import { prisma } from "../../configs/prisma-client.config";

export const AuthRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  },

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    houseNumber: string;
    address: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        houseNumber: data.houseNumber,
        address: data.address,
      },
    });
  },
};
