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

BillRoute.get("/",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]),BillController.getBills)