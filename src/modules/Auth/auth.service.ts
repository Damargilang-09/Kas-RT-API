import { StatusCodes } from "http-status-codes";
import type { RegisterRequest } from "./auth.types";
import { AuthRepository } from "./auth.repository";
import { AppError } from "../../utils/app-error";
import { hashPassword } from "../../utils/password";

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
};
