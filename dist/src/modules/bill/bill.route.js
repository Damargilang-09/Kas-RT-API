"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBillRoute = exports.BillRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const prisma_1 = require("../../../generated/prisma");
const bill_controller_1 = require("./bill.controller");
exports.BillRoute = (0, express_1.Router)();
exports.BillRoute.post("/generate", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), bill_controller_1.BillController.generateBills);
exports.BillRoute.get("/", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), bill_controller_1.BillController.getBills);
exports.BillRoute.patch("/cancel-batch", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), bill_controller_1.BillController.cancelBillBatch);
exports.BillRoute.get("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([prisma_1.UserRole.bendahara]), bill_controller_1.BillController.getBillDetail);
exports.MyBillRoute = (0, express_1.Router)();
exports.MyBillRoute.get("/", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([
    prisma_1.UserRole.bendahara,
    prisma_1.UserRole.ketuaRT,
    prisma_1.UserRole.warga,
]), bill_controller_1.BillController.getMyBills);
exports.MyBillRoute.get("/:id", auth_middleware_1.AuthMiddleware.authenticated, auth_middleware_1.AuthMiddleware.authorized([
    prisma_1.UserRole.bendahara,
    prisma_1.UserRole.ketuaRT,
    prisma_1.UserRole.warga,
]), bill_controller_1.BillController.getMyBillDetail);
//# sourceMappingURL=bill.route.js.map