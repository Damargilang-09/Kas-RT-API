import type { Response, Request } from "express";
import { validate } from "../../validations/validation";
import { BillValidation } from "./bill.validation";
import { BillService } from "./bill.service";
import { StatusCodes } from "http-status-codes";

export class BillController {
  static async generateBills(req: Request, res: Response) {
    const { body } = validate(BillValidation.GENERATE, { body: req.body });

    const payload = res.locals?.payload;

    const generateBills = await BillService.generateBill({ body, payload });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Tagihan Iuran Batch Berhasil Dibuat!",
      data: generateBills,
    });
  }

  static async getBills(req: Request, res: Response) {
    const { query } = validate(BillValidation.LIST_QUERY, { query: req.query });

    const getBills = await BillService.getBills({ query });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "List Tagihan Iuran Berhasil Didapat!",
      data: getBills
    });
  }
}
