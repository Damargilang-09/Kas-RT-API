import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserRole } from "../../../generated/prisma";
import { SuperAdminController } from "./super_admin.controller";

export const SuperAdminRoutes = Router();

SuperAdminRoutes.get(
  "/user-list",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.superAdmin]),
  SuperAdminController.getUsers,
);

SuperAdminRoutes.get(
  "/user/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.superAdmin]),
  SuperAdminController.getUserDetail,
);

SuperAdminRoutes.patch(
  "/user/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.superAdmin]),
  SuperAdminController.updateKetua,
);
