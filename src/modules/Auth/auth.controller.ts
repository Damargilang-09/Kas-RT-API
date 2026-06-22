import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service";
import type { AuthenticatedRequest } from "./auth.types";

export const AuthController = {
  async register(req: AuthenticatedRequest, res: Response) {
    const { name, email, password, houseNumber, address } = req.body;

    const registeredUser = await AuthService.register({
      name,
      email,
      password,
      houseNumber,
      address,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Akun telah terdaftar. Mohon tunggu verifikasi dari admin.",
      data: registeredUser,
    });
  },

  async login(req: AuthenticatedRequest, res: Response) {
    const { email, password } = req.body;

    const loginResult = await AuthService.login({ email, password });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login berhasil",
      data: loginResult,
    });
  },

  async me(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "User belum login",
      });
      return;
    }

    const user = await AuthService.me(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Data user login berhasil diambil",
      data: user,
    });
  },
};
