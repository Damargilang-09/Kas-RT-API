import { Request, Response } from "express";
import { ReportsServices } from "./reports.services";
import { StatusCodes } from "http-status-codes";
import { ReportsValidation } from "./reports.validation";
import { validate } from "../../validations/validation";
import { ResponseError } from "../../utils/response-error.util";
export class ReportsController {
  static async dashboard(req: Request, res: Response) {
    const result = await ReportsServices.dashboard();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `data berhsail di dapatkan`,
      data: result,
    });
  }

  static async create(req: Request, res: Response) {
    const { body } = validate(ReportsValidation.CREATE_REPORT, {
      body: req.body,
    });

    const file = req.file;

    if (!file) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Bukti rekening koran wajib diunggah",
      );
    }

    const formattedReports = await ReportsServices.create({ body }, file);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Permohonan pembuatan laporan akhir bulan berhasil dibuat",
      data: formattedReports,
    });
  }

  static async getAll(req: Request, res: Response) {
    const { query } = validate(ReportsValidation.LIST_QUERY, {
      query: req.query,
    });

    const { formattedReports, meta } = await ReportsServices.getAll({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "histori report berhasil didapatkan.",
      data: formattedReports,
      meta,
    });
  }
  static async getById(req: Request, res: Response) {
    const { params } = validate(ReportsValidation.REPORT_DETAIL, {
      params: req.params,
    });

    const formattedReport = await ReportsServices.getById({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      massage: "Detail report berhasil didapatkan.",
      data: formattedReport,
    });
  }

  static async approval(req: Request, res: Response) {
    const { params, body } = validate(ReportsValidation.APPROVAL_REPORTS, {
      params: req.params,
      body: req.body,
    });

    const formattedReport = await ReportsServices.approval({ params, body });

    res.status(StatusCodes.OK).json({
      success: true,
      massage: "Approval laporan berhasil dilakukan.",
      date: formattedReport,
    });
  }
  static async delete(req: Request, res: Response) {
    const { params } = validate(ReportsValidation.REPORT_DETAIL, {
      params: req.params,
    });

    await ReportsServices.delete({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "laporan berhasil di hapus",
    });
  }
}
