import { StatusCodes } from "http-status-codes";
import { prisma } from "../../configs/prisma-client.config";
import { ResponseError } from "../../utils/response-error.util";
import type { AuthLoginRequest, AuthRegisterRequest } from "./auth.validation";
import { BcryptUtil } from "../../utils/bycrpt.util";
import { UserRole, UserStatus } from "../../../generated/prisma";
import { email } from "zod";
import { th } from "zod/locales";
import { JWTUtil } from "../../utils/jwt.util";
import { TemplateUtil } from "../mail/templates/utils/template.util";
import { MailService } from "../mail/mail.service";

export class AuthService {
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

    const user = await prisma.user.create({
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

    await MailService.sendRegisterWaitingActivation({
      // ini menyingkat semua proses.
      name: user.name, // proses e mail.config siapin transporter, dipake sama mailer.util, dipake lagi sama mail.service ambil template, kirim ke auth sevice.!
      email: user.email,
    });
    const { id, passwordHash, ...safeUser } = user;

    return safeUser;
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

    if (existingUser.status !== UserStatus.active) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        "Akun Anda belum aktif. Silahkan tunggu aktivasi dari Admin",
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

    const token = JWTUtil.signToken({
      id: existingUser.id,
      role: existingUser.role,
    });

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
