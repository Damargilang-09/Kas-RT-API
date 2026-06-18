import { Router } from "express";
import { AuthControler } from "./auth.controller";

const router = Router();

router.post("/register",(AuthControler.register))
router.post("/login",(AuthControler.login))

export default router