import { Router } from "express";
import { BillCronController } from "./bill.cron.controller";

export const BillCronRoute = Router();

BillCronRoute.get("/bills/overdue", BillCronController.updateOverdueBills);
