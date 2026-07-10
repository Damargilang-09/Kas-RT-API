import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/users/user.route";
import { FeeRoutes } from "../modules/fee_type/fee.route";
import { BillRoute, MyBillRoute } from "../modules/bill/bill.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/fee-types", FeeRoutes);
router.use("/bills", BillRoute);
router.use('/my-bills',MyBillRoute)

export default router;
