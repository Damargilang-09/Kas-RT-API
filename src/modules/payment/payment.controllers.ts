import { Request, Response } from "express";
import { PaymentValidation } from "./payment.validations";
import { validate } from "../../validations/validation";
import { StatusCodes } from "http-status-codes";
import { PaymentServices } from "./payment.services";
import { ResponseError } from "../../utils/response-error.util";
import { QueryValidation } from "../../validation/queryValidation";

export class PaymentController {
  static async create(req: Request, res: Response) {
    const payload = res.locals?.payload;
    // TODO: ganti userId dari req.body ke req.user.id setelah authenticate middleware aktif
    const { params, body } = validate(PaymentValidation.CREATE_PAYMENT, {
      params: req.params,
      body: req.body,
    });
    const file = req.file;

    if (!file) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Bukti pembayaran wajib diunggah",
      );
    }

    const createdPayment = await PaymentServices.create(
      { params, body },
      file,
      payload,
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: `pembayaran berhasil dilakukan`,
      data: createdPayment,
    });
  }
  static async getAll(req: Request, res: Response) {
    const { query } = validate(QueryValidation.LIST_QUERY, {
      query: req.query,
    });

    const { formattedPayments, meta } = await PaymentServices.getAll({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "histori pembayaran berahasil di dapatkan",
      data: formattedPayments,
      meta,
    });
  }
  static async getById(req: Request, res: Response) {
    const { params } = validate(PaymentValidation.PAYMENT_DETAIL, {
      params: req.params,
    });

    const findPayment = await PaymentServices.getById({ params });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "detail pembayaran berhasil di dapatkan",
      data: findPayment,
    });
  }
  //todo: buat get tagihan per user hanya milik user
  static async getByUserId(req: Request, res: Response) {
    const payload = res.locals.payload;
    const { query } = validate(QueryValidation.LIST_QUERY, {
      query: req.query,
    });

    const { formattedPayments, meta } = await PaymentServices.grtByUserId(
      payload,
      { query },
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "detail pembayaran berhasil di dapatkan",
      data: formattedPayments,
      meta,
    });
  }

  static async approve(req: Request, res: Response) {
    const payload = res.locals?.payload;
    const { params, body } = validate(PaymentValidation.APPROVAL_PAYMENT, {
      params: req.params,
      body: req.body,
    });

    const formattedPayment = await PaymentServices.approve(
      { params, body },
      payload,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Approval berhasil dilakukan",
      data: formattedPayment,
    });
  }

  static async delete(req: Request, res: Response) {
    const payload = res.locals?.payload
    const { params } = validate(PaymentValidation.PAYMENT_DETAIL, {
      params: req.params,
    });
    await PaymentServices.delete({ params },payload);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Anda berhasil menghapus histori pembayaran",
    });
  }
}
