import type { Request, Response } from "express";
import { UserService } from "./user.service";
import { StatusCodes } from "http-status-codes";
import { validate } from "../../validations/validation";
import { UserValidation } from "./user.validation";

import { ResponseError } from "../../utils/response-error.util";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    console.log("USER CONTROLLER : GET_USER [REQUEST MASUK]");
    console.log("Query :", req.query);
    console.log("Payload:", res.locals.payload);

    const { query } = validate(UserValidation.LIST_QUERY, { query: req.query });
    console.log("[USER_CONTROLLER][GET_USERS] Query setelah validasi:", query);
    const { users, meta } = await UserService.getUsers({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "List data users berhasil diterima!",
      data: users,
      meta,
    });
  }

  static async getUserDetail(req: Request, res: Response) {
    console.log("USER CONTROLLER : GET_USER_DETAIL [REQUEST MASUK]");
    console.log("PARAMS :", req.params);
    console.log("Payload:", res.locals.payload);

    const { params } = validate(UserValidation.DETAIL, { params: req.params });
    console.log(
      "[USER_CONTROLLER][GET_USER_DETAIL] Params setelah validasi:",
      params,
    );

    const user = await UserService.getUserDetail({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail User berhasil diterima!",
      data: user,
    });
  }

  static async updateUser(req: Request, res: Response) {
    console.log("USER CONTROLLER : UPDATE_USER [REQUEST MASUK]");
    console.log("PARAMS :", req.params);
    console.log("BODY :", req.body);
    console.log("Payload:", res.locals.payload);

    const { params, body } = validate(UserValidation.UPDATE, {
      params: req.params,
      body: req.body,
    });
    console.log(
      "[USER_CONTROLLER][UPDATE_USER] Params setelah validasi:",
      params,
    );
    console.log("[USER_CONTROLLER][UPDATE_USER]Body setelah validasi:", body);

    const payloadCheck = res.locals.payload;
    if (payloadCheck.id === params.id) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Tidak boleh mengubah status atau role sendiri!",
      );
    }

    const updateUser = await UserService.updateUser({ params, body });
    console.log("STATUS SETELAH SERVICE:", updateUser.status);
    console.log("ROLE SETELAH SERVICE:", updateUser.role);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "User berhasil di-update!",
      data: updateUser,
    });
  }
}
