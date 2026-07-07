import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.util";
import type { AuthLoginRequest, AuthRegisterRequest } from "./auth.validation";
import { BcryptUtil } from "../../utils/bycrpt.util";
import { UserRole, UserStatus } from "../../../generated/prisma";

import { JWTUtil } from "../../utils/jwt.util";

import { MailService } from "../mail/mail.service";

export class AuthService {
  // TODO: known issue - user yang di-softdelete tidak bisa register ulang
  // dengan email yang sama karena unique constraint. Belum di-handle karena scope project terbatas.

  static async register({ body }: AuthRegisterRequest) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existingEmail) {
      throw new ResponseError(StatusCodes.CONFLICT, "Email sudah terdaftar!");
    }
    const existingHouse = await prisma.user.findUnique({
      where: { houseNumber: body.houseNumber },
    });
    if (existingHouse) {
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Nomor Blok Rumah sudah terdaftar!",
      );
    }

    const passwordHashed = await BcryptUtil.hash(body.password);

    const safeUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: body.name,
          email: body.email,
          passwordHash: passwordHashed,
          role: UserRole.warga,
          houseNumber: body.houseNumber,
          address: body.address,
          status: UserStatus.inactive,
        },
      });

      await MailService.sendRegisterWaitingActivation(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        tx,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userNoPassword } = user;
      return userNoPassword
    });

    return safeUser
  }

  static async login({ body }: AuthLoginRequest) {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!existingUser) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        "Email atau Password Salah!",
      );
    }

    if (existingUser.deletedAt) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        "Akun anda sudah tidak aktif",
      );
    }

    const isValid = await BcryptUtil.compare(
      body.password,
      existingUser.passwordHash,
    );

    if (!isValid) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        "Email atau Password Salah!",
      );
    }

    if (existingUser.status !== UserStatus.active) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        "Akun Anda belum aktif. Silahkan tunggu aktivasi dari Ketua RT",
      );
    }

    const token = JWTUtil.signToken({
      id: existingUser.id,
      role: existingUser.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = existingUser;
    return { safeUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        houseNumber: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }
    return user;
  }
}
