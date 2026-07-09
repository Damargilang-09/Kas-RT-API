import { Router } from "express";
import paymentRoutes from "../modules/payment/payment.routes";
import expensesRoutes from "../modules/expenses/expenses.routes";
import incomeRoutes from "../modules/income/income.routes";

const router = Router();

router.use("/payment", paymentRoutes);
router.use("/expenses", expensesRoutes);
router.use("/income", incomeRoutes);

export default router;
