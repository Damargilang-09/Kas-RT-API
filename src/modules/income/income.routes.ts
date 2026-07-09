import { Router } from "express";
import { IncomeController } from "./income.controllers";

const router = Router();

router.post("/", IncomeController.create);
router.get("/", IncomeController.getAll);
router.get("/:id", IncomeController.getById);
router.patch("/:id", IncomeController.approve);
router.delete("/:id", IncomeController.delete);

export default router;
