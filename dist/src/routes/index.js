"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/users/user.route");
const fee_route_1 = require("../modules/fee_type/fee.route");
const bill_route_1 = require("../modules/bill/bill.route");
const router = (0, express_1.Router)();
router.use("/auth", auth_route_1.AuthRoutes);
router.use("/users", user_route_1.UserRoutes);
router.use("/fee-types", fee_route_1.FeeRoutes);
router.use("/bills", bill_route_1.BillRoute);
router.use('/my-bills', bill_route_1.MyBillRoute);
exports.default = router;
//# sourceMappingURL=index.js.map