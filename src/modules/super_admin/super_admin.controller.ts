import type { Request, Response } from "express";
import { validate } from "../../validations/validation";
import { SuperAdminValidation } from "./super_admin.validation";
import { SuperAdminService } from "./super_admin.service";
import { StatusCodes } from "http-status-codes";

export class SuperAdminController {
  static async getUsers(req: Request, res: Response) {
    const { query } = validate(SuperAdminValidation.LIST_QUERY, {
      query: req.query,
    });

    const getUsers = await SuperAdminService.getUsers({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "List Users berhasil didapatkan",
      data: getUsers,
    });
  }

  static async getUserDetail(req: Request, res: Response) {
    const { params } = validate(SuperAdminValidation.GET_DETAIL, {
      params: req.params,
    });

    const user = await SuperAdminService.getUserDetail({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail User Berhasil Diterima",
      data: user,
    });
  }

  static async updateKetua(req: Request, res: Response) {
    const { params } = validate(SuperAdminValidation.UPDATE_KETUA, {
      params: req.params,
    });
    const payload = res.locals?.payload;

    const updateKetuaRT = await SuperAdminService.updateKetua({
      params,
      payload,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Update Status dan Aktivasi Ketua RT telah berhasil!",
      data: updateKetuaRT,
    });
  }

  static async removeKetua(req: Request, res: Response) {
    const { params } = validate(SuperAdminValidation.REMOVE_KETUA, {
      params: req.params,
    });
    const payload = res.locals?.payload;

    const removedKetuaRT = await SuperAdminService.removeKetua({
      params,
      payload,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ketua RT berhasil dicabut tanpa pengganti",
      data: removedKetuaRT,
    });
  }
}