import { Router } from "express";
import paymentRoutes from "../modules/payment/payment.routes";
import expensesRoutes from "../modules/expenses/expenses.routes"

const router = Router();

router.use("/payment", paymentRoutes);
router.use("/expenses",expensesRoutes);

export default router;