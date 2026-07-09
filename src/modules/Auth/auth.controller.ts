import type { Request, Response } from "express";
import { validate } from "../../validations/validation";
import { AuthValidation } from "./auth.validation";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";

export class AuthController {
  static async register(req: Request, res: Response) {
    console.log("USER REGISTER REQUEST:", {
      method: req.method,
      url: req.originalUrl,
      body: {
        email: req.body.email,
        password: req.body?.password
          ? "Password Diterima"
          : "Password Tidak Ditemukan",
      },
    });

    const { body } = validate(AuthValidation.REGISTER_USER, { body: req.body });

    const safeUser = await AuthService.register({ body });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User berhasil didaftarkan!",
      data: safeUser,
    });
  }

  static async login(req: Request, res: Response) {
    console.log("USER LOGIN REQUEST:", {
      method: req.method,
      url: req.originalUrl,
      body: {
        email: req.body.email,
        password: req.body?.password
          ? "Password Diterima"
          : "Password Tidak Ditemukan",
      },
    });

    const { body } = validate(AuthValidation.LOGIN_USER, { body: req.body });

    const { safeUser, token } = await AuthService.login({ body });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      // secure:true, jangan lupa diganti kalo udah production
      sameSite: true,
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

  static async logout(req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      // secure:true, jangan lupa diganti kalo udah production
      secure: false,
      sameSite: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logout user berhasil!",
      data: null,
    });
  }
}
