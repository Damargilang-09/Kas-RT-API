import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { updateOverdueBills } from "./bill.cron";

export class BillCronController {
  static async updateOverdueBills(req: Request, res: Response) {
    const cronSecret = process.env.CRON_SECRET;
    const authorizationHeader = req.headers.authorization;

    if (!cronSecret || authorizationHeader !== `Bearer ${cronSecret}`) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized cron request",
      });
      return;
    }

    const updatedCount = await updateOverdueBills();

    console.log(
      `[VERCEL CRON] ${updatedCount} tagihan diubah menjadi overdue`,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Pengecekan tagihan overdue berhasil dijalankan",
      data: {
        updatedCount,
      },
    });
  }
}
