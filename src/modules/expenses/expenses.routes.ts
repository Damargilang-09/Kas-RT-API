import { Router } from "express";
import { ExpensesController } from "./expenses.controllers";
import { MulterMiddleware } from "../../middlewares/multer.midleware";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const multerUploads = new MulterMiddleware(
  ["image/jpeg", "image/png", "image/webp"],
  "memoryStorage",
).upload(MAX_FILE_SIZE);

router.post("/",multerUploads.array("EXPENSES_IMAGES", 3),ExpensesController.create,);
router.get("/", ExpensesController.getAll);
router.get("/:id", ExpensesController.getById);
router.patch("/:id", ExpensesController.approve);
router.delete("/:id", ExpensesController.delete);

export default router;
