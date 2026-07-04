import { Router } from "express";
import paymentRoutes from '../modules/payment/payment.routes'

const router = Router();

router.use('/payment', paymentRoutes)


export default router