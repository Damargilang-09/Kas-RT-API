import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/users/user.route";
import { FeeRoutes } from "../modules/fee_type/fee.route";
import { BillRoute, MyBillRoute } from "../modules/bill/bill.route";
import { BillCronRoute } from "../modules/bill/bill.cron.route";
import { SuperAdminRoutes } from "../modules/super_admin/super_admin.route";
import paymentRoutes from "../modules/payment/payment.routes";
import expensesRoutes from "../modules/expenses/expenses.routes";
import incomeRoutes from "../modules/income/income.routes";
import reportRoutes from "../modules/reports/reports.routes"


const router = Router();

router.use("/payment", paymentRoutes);
router.use("/expenses", expensesRoutes);
router.use("/income", incomeRoutes);
router.use("/report",reportRoutes)
router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/fee-types", FeeRoutes);
router.use("/bills", BillRoute);
router.use("/cron", BillCronRoute);
router.use('/my-bills',MyBillRoute)
router.use('/super-admin',SuperAdminRoutes)


export default router;
