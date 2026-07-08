import { Request, Response } from "express";
import { validate } from "../../validation/validation";
import { ExpensesValidation } from "./expenses.validation";
import { ExpensesService } from "./expenses.services";
import { StatusCodes } from "http-status-codes";
import { QueryValidation } from "../../validation/queryValidation";

export class ExpensesController {
  //TODO ini masih sementara menyisipkan user id lewat body karna belum di integrasikan dengan auth
  static async create(req: Request, res: Response) {
    const { body } = validate(ExpensesValidation.CREATE_EXPENSES, {
      body: req.body,
    });
    const files: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : [];

    const createdExpenses = await ExpensesService.create({ body }, files);

    res.status(StatusCodes.OK).json({
      success: true,
      massage: `pencatatan pengeluaran ${createdExpenses.title} dengan jumlah ${createdExpenses.amount} berhasil dibuat. Status: Menunggu Persetujuan Ketua RT.`,
      data: createdExpenses,
    });
  }

  static async getAll(req: Request, res: Response) {
    const { query } = validate(QueryValidation.LIST_QUERY, {
      query: req.query,
    });

    const { formattedExpenses, meta } = await ExpensesService.getAll({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "histori pencatatan pengeluaran berahasil di dapatkan",
      data: formattedExpenses,
      meta,
    });
  }

  //todo: tambahkan get ke table expenses_images untuk mendapatkan semua gambar yang berhubungan dengan expensesId
  static async getById(req: Request, res: Response) {
    const { params } = validate(ExpensesValidation.EXPENSES_DETAIL, {
      params: req.params,
    });

    const findExpenses = await ExpensesService.getById({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `detail catatan pengeluaran ${findExpenses.title} berhasil di dapatkan`,
      data: findExpenses,
    });
  }
  static async approve(req: Request, res: Response) {
    const { params, body } = validate(ExpensesValidation.APPROVAL_EXPENSES, {
      params: req.params,
      body: req.body,
    });

    const result = await ExpensesService.approve({ params, body });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `catatan pengeluaran ${result.title} berhasil di update`,
      data: result,
    });
  }

  static async delete(req: Request, res: Response) {
    const { params } = validate(ExpensesValidation.EXPENSES_DETAIL, {
      params: req.params,
    });

    await ExpensesService.delete({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "pengajuan berhasil di hapus",
    });
  }
}
