import { Router } from "express";
import authRouter from "../modules/Auth/auth.router";
import usersRouter from "../modules/Users/users.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);

export default router;
