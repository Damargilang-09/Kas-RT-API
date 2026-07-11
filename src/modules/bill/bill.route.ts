import { Router } from "express";
import { AuthMiddleware } from "../auth/auth.middleware";
import { UserRole } from "../../../generated/prisma";
import { BillController } from "./bill.controller";

export const BillRoute = Router();

BillRoute.post(
  "/generate",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  BillController.generateBills,
);

BillRoute.get(
  "/",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  BillController.getBills,
);

BillRoute.patch(
  "/cancel-batch",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  BillController.cancelBillBatch,
);

BillRoute.get(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  BillController.getBillDetail,
);

export const MyBillRoute = Router();

MyBillRoute.get(
  "/",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([
    UserRole.bendahara,
    UserRole.ketuaRT,
    UserRole.warga,
  ]),
  BillController.getMyBills,
);

MyBillRoute.get(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([
    UserRole.bendahara,
    UserRole.ketuaRT,
    UserRole.warga,
  ]),
  BillController.getMyBillDetail,
);
