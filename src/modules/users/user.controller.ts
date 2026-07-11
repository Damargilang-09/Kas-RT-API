import type { Request, Response } from "express";
import { UserService } from "./user.service";
import { StatusCodes } from "http-status-codes";
import { validate } from "../../validations/validation";
import { UserValidation } from "./user.validation";

import { ResponseError } from "../../utils/response-error.util";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    const { query } = validate(UserValidation.LIST_QUERY, { query: req.query });

    const result = await UserService.getUsers({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "List data users berhasil diterima!",
      data: result,
    });
  }

  static async getUserDetail(req: Request, res: Response) {
    const { params } = validate(UserValidation.DETAIL, { params: req.params });

    const user = await UserService.getUserDetail({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail User berhasil diterima!",
      data: user,
    });
  }

  static async updateUser(req: Request, res: Response) {
    const { params, body } = validate(UserValidation.UPDATE, {
      params: req.params,
      body: req.body,
    });

    const payloadCheck = res.locals.payload;
    if (payloadCheck.id === params.id) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Tidak boleh mengubah status atau role sendiri!",
      );
    }

    const updateUser = await UserService.updateUser({ params, body });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User berhasil di-update!",
      data: updateUser,
    });
  }
}
