import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "../../middlewares/auth.middleware";

export const AuthRoutes = Router();

AuthRoutes.post("/register", AuthController.register);
AuthRoutes.post("/login", AuthController.login);

AuthRoutes.get("/me", AuthMiddleware.authenticated, AuthController.getMe);
AuthRoutes.post("/logout",  AuthController.logout);
