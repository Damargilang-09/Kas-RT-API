import type { Request, Response } from "express";
import { FeeService } from "./fee.service";
import { StatusCodes } from "http-status-codes";
import { validate } from "../../validations/validation";
import { FeeValidation } from "./fee.validation";

export class FeeController {
  static async getFeeTypes(_req: Request, res: Response) {
    const feeTypeList = await FeeService.getFeeTypes();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Data Jenis Tagihan Berhasil Diterima!",
      data: feeTypeList,
    });
  }
  static async createFeetype(req: Request, res: Response) {
    const { body } = validate(FeeValidation.CREATE, { body: req.body });

    const payload = res.locals.payload;

    const feeType = await FeeService.createFeeType({ body }, payload);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Jenis Tagihan Berhasil Dibuat!",
      data: feeType,
    });
  }

  static async getFeeTypeDetail(req: Request, res: Response) {
    const { params } = validate(FeeValidation.DETAIL, { params: req.params });

    const feeTypeDetail = await FeeService.getFeeTypeDetail({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail Jenis Tagihan Berhasil Diterima",
      data: feeTypeDetail,
    });
  }

  static async updateFeeType(req: Request, res: Response) {
    const { params, body } = validate(FeeValidation.UPDATE, {
      params: req.params,
      body: req.body,
    });

    const payload = res.locals.payload;

    const result = await FeeService.updateFeeType({ params, body, payload });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Jenis Tagihan Berhasil Diupdate!",
      data: result,
    });
  }
  static async deleteFeeType(req: Request, res: Response) {
    const { params } = validate(FeeValidation.DELETE, { params: req.params });

    const deletedFeeType = await FeeService.deleteFeeType({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Jenis Tagihan Berhasil Dihapus",
      data: deletedFeeType,
    });
  }
}
