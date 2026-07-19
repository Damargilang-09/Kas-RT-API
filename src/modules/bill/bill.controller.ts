import type { Response, Request } from "express";
import { validate } from "../../validations/validation";
import { BillValidation } from "./bill.validation";
import { BillService } from "./bill.service";
import { StatusCodes } from "http-status-codes";

export class BillController {
  static async generateBills(req: Request, res: Response) {
    const { body } = validate(BillValidation.GENERATE, {
      body: req.body,
    });

    const payload = res.locals.payload;

    const result = await BillService.generateBill({
      body,
      payload,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Tagihan Iuran Batch Berhasil Dibuat!",
      data: result,
    });
  }

  static async getBills(req: Request, res: Response) {
    const { query } = validate(BillValidation.LIST_QUERY, {
      query: req.query,
    });

    const { bills, meta } = await BillService.getBills({
      query,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "List Tagihan Iuran Berhasil Didapat!",
      data: bills,
      meta,
    });
  }

  static async getBillDetail(req: Request, res: Response) {
    const { params } = validate(BillValidation.DETAIL, {
      params: req.params,
    });

    const result = await BillService.getBillDetail({
      params,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail Tagihan Iuran Berhasil Didapat!",
      data: result,
    });
  }

  static async cancelBillBatch(req: Request, res: Response) {
    const { body } = validate(BillValidation.CANCEL_BATCH, {
      body: req.body,
    });

    const payload = res.locals.payload;

    const result = await BillService.cancelBillBatch({
      body,
      payload,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Batch Tagihan Berhasil Dibatalkan!",
      data: result,
    });
  }

  static async getMyBills(req: Request, res: Response) {
    const { query } = validate(BillValidation.MY_BILLS_QUERY, {
      query: req.query,
    });

    const payload = res.locals?.payload;
    const { bills, meta, summary } = await BillService.getMyBills({
      payload,
      query,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "List Tagihan Berhasil Diterima",
      data: bills,
      meta,
      summary,
    });
  }

  static async getMyBillDetail(req: Request, res: Response) {
    const { params } = validate(BillValidation.MY_BILL_DETAIL, {
      params: req.params,
    });
    const payload = res.locals?.payload;
    const myBillDetail = await BillService.getMyBillDetail({ params, payload });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail Tagihan Saya Berhasil Diterima",
      data: myBillDetail,
    });
  }
}
