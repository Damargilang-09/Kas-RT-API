import { Router } from "express";
import { AuthMiddleware } from "../auth/auth.middleware";
import { UserRole } from "../../../generated/prisma";
import { FeeController } from "./fee.controller";


export const FeeRoutes = Router();

FeeRoutes.get(
  "/",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  FeeController.getFeeTypes,
);
FeeRoutes.post(
  "/",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  FeeController.createFeetype,
);

FeeRoutes.get(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  FeeController.getFeeTypeDetail,
);

FeeRoutes.patch(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  FeeController.updateFeeType,
);

FeeRoutes.delete(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  FeeController.deleteFeeType,
);

