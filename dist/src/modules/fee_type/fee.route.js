"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const prisma_1 = require("../../../generated/prisma");
const fee_controller_1 = require("./fee.controller");
exports.FeeRoutes = (0, express_1.Router)();
exports.FeeRoutes.get("/", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), fee_controller_1.FeeController.getFeeTypes);
exports.FeeRoutes.post("/", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), fee_controller_1.FeeController.createFeetype);
exports.FeeRoutes.get("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), fee_controller_1.FeeController.getFeeTypeDetail);
exports.FeeRoutes.patch("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), fee_controller_1.FeeController.updateFeeType);
exports.FeeRoutes.delete("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), fee_controller_1.FeeController.deleteFeeType);
//# sourceMappingURL=fee.route.js.map