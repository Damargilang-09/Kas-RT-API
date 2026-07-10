"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
exports.AuthRoutes = (0, express_1.Router)();
exports.AuthRoutes.post("/register", auth_controller_1.AuthController.register);
exports.AuthRoutes.post("/login", auth_controller_1.AuthController.login);
exports.AuthRoutes.get("/me", auth_middleware_1.AuthMiddleware.authenticated, auth_controller_1.AuthController.getMe);
exports.AuthRoutes.post("/logout", auth_middleware_1.AuthMiddleware.authenticated, auth_controller_1.AuthController.logout);
//# sourceMappingURL=auth.route.js.map