import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";


export const AuthController = {
  async register(req: Request, res: Response) {
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
      message: "Akun telah terdaftar.",
      data: registeredUser,
    });
  },
  async login() {},
};
