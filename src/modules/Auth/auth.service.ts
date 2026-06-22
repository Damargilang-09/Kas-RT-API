import { StatusCodes } from "http-status-codes";
import type { LoginRequest, RegisterRequest } from "./auth.types";
import { AuthRepository } from "./auth.repository";
import { AppError } from "../../utils/app-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";

export const AuthService = {
  async register({
    name,
    email,
    password,
    houseNumber,
    address,
  }: RegisterRequest) {
    const existingUser = await AuthRepository.findUserByEmail(email);

    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, "Email sudah terdaftar");
    }

    const passwordHash = await hashPassword(password);

    const registeredUser = await AuthRepository.createUser({
      name,
      email,
      passwordHash,
      houseNumber,
      address,
    });

    const { passwordHash: _, ...safeUser } = registeredUser;

    return safeUser;
  },

  async login({ email, password }: LoginRequest) {
    const user = await AuthRepository.findUserByEmail(email);

    if (!user || user.deletedAt) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Email atau password salah"
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Email atau password salah"
      );
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Akun Anda belum aktif. Silakan tunggu verifikasi admin."
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  },

  async me(userId: string) {
    const user = await AuthRepository.findUserById(userId);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User tidak ditemukan");
    }

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  },
};
