import type { Request, Response } from "express";
import { validate } from "../../validations/validation";
import { AuthValidation } from "./auth.validation";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import { NODE_ENV } from "../../configs/env.config";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { body } = validate(AuthValidation.REGISTER_USER, { body: req.body });

    const safeUser = await AuthService.register({ body });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User berhasil didaftarkan!",
      data: safeUser,
    });
  }

  static async login(req: Request, res: Response) {
    const { body } = validate(AuthValidation.LOGIN_USER, { body: req.body });

    const { safeUser, token } = await AuthService.login({ body });

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login user berhasil!",
      data: safeUser,
    });
  }

  static async getMe(req: Request, res: Response) {
    const payload = res.locals.payload;

    const getMe = await AuthService.getMe(payload.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Berhasil mengambil data user login!",
      data: getMe,
    });
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logout user berhasil!",
      data: null,
    });
  }
}
