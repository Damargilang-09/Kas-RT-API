import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/users/user.route";
import { FeeRoutes } from "../modules/fee_type/fee.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/fee-types", FeeRoutes);

export default router;
