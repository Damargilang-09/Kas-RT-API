import { Request, Response } from "express";
import { PaymentValidation } from "./payment.validations";
import { validate } from "../../validation/validation";
import { StatusCodes } from "http-status-codes";
import { PaymentServices } from "./payment.services";
import { ResponseError } from "../../utils/response-error.utils";

export class PaymentController {
  static async create(req: Request, res: Response) {
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

    const createdPayment = await PaymentServices.create({ params, body }, file);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: `pembayaran berhasil dilakukan`,
      data: createdPayment,
    });
  }
  static async getAll(req: Request, res: Response) {
    const { query } = validate(PaymentValidation.LIST_QUERY, {
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
  static async getByUserId(req: Request, res: Response) {}

  static async update(req: Request, res: Response) {
    const { params, body } = validate(PaymentValidation.APROVAL_PAYMENT, {
      params: req.params,
      body: req.body,
    });
  const updatedPayment = await PaymentServices.update({params,body});

   res.status(StatusCodes.OK).json({
      success: true,
      message: "Approval berhasil dilakukan",
      data: updatedPayment,
    });
  }

  static async delete(req: Request, res: Response) {
    const { params } = validate(PaymentValidation.PAYMENT_DETAIL, {
      params: req.params,
    });
    await PaymentServices.delete({params})
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Anda berhasil menghapus histori pembayaran"
    })
  }
}
