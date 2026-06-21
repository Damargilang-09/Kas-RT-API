import { Router } from "express";
import { AuthController } from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.schema";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

export default router;
