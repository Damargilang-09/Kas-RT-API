import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/users/user.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);

export default router;
