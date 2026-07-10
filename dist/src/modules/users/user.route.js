"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const prisma_1 = require("../../../generated/prisma");
const user_controller_1 = require("./user.controller");
exports.UserRoutes = (0, express_1.Router)();
exports.UserRoutes.get("/", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.ketuaRT]), user_controller_1.UserController.getUsers);
exports.UserRoutes.get("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.ketuaRT]), user_controller_1.UserController.getUserDetail);
exports.UserRoutes.patch("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.ketuaRT]), user_controller_1.UserController.updateUser);
//# sourceMappingURL=user.route.js.map