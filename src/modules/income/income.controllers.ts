import { Request, Response } from "express";
import { IncomeValidation } from "./income.validation";
import { validate } from "../../validations/validation";
import { IncomeService } from "./income.services";
import { StatusCodes } from "http-status-codes";
import { QueryValidation } from "../../validations/queryValidation";

export class IncomeController {
  static async create(req: Request, res: Response) {
    const payload = res.locals?.payload;
    const { body } = validate(IncomeValidation.CREATE_INCOME, {
      body: req.body,
    });

    const formattedIncome = await IncomeService.create({ body }, payload);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Pengajuan income berhasil dibuat.",
      data: formattedIncome,
    });
  }
  static async getAll(req: Request, res: Response) {
    const { query } = validate(QueryValidation.LIST_QUERY, {
      query: req.query,
    });

    const { formattedIncome, meta } = await IncomeService.getAll({ query });

    res.status(StatusCodes.OK).json({
      succes: true,
      massage: "Histori pencatatan income berhasil di dapatkan",
      data: formattedIncome,
      meta,
    });
  }
  static async getById(req: Request, res: Response) {
    const { params } = validate(IncomeValidation.GET_DETAIL_INCOME, {
      params: req.params,
    });

    const safeIncome = await IncomeService.getById({ params });

    res.status(StatusCodes.OK).json({
      succes: true,
      massage: "detail pencatatan income berhasil di dapatkan",
      data: safeIncome,
    });
  }
  static async approve(req: Request, res: Response) {
    const payload = res.locals?.payload;
    const { params, body } = validate(IncomeValidation.APPROVAL_INCOME, {
      params: req.params,
      body: req.body,
    });

    const formattedIncome = await IncomeService.approve(
      { params, body },
      payload,
    );

    res.status(StatusCodes.OK).json({
      succes: true,
      massage: `approval ${formattedIncome.title} berhasil dilakukan`,
      data: formattedIncome,
    });
  }
  static async delete(req: Request, res: Response) {
    const payload = res.locals?.payload;
    const { params } = validate(IncomeValidation.GET_DETAIL_INCOME, {
      params: req.params,
    });

    await IncomeService.delete({ params }, payload);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "pengajuan berhasil di hapus",
    });
  }
}
