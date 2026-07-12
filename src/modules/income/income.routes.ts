import { Router } from "express";
import { IncomeController } from "./income.controllers";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserRole } from "../../../generated/prisma";

const router = Router();

router.post("/",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]), IncomeController.create);
router.get("/",AuthMiddleware.authenticated, IncomeController.getAll);
router.get("/:id",AuthMiddleware.authenticated, IncomeController.getById);
router.patch("/:id",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.ketuaRT]), IncomeController.approve);
router.delete("/:id",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]), IncomeController.delete);

export default router;
