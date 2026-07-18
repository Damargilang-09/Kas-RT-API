import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserRole } from "../../../generated/prisma";
import { UserController } from "./user.controller";

export const UserRoutes = Router();

UserRoutes.get(
  "/",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.ketuaRT]),
  UserController.getUsers,
);

UserRoutes.get(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.ketuaRT]),
  UserController.getUserDetail,
);

UserRoutes.patch(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.ketuaRT]),
  UserController.updateUser,
);

UserRoutes.delete(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.ketuaRT]),
  UserController.deleteUser,
);
