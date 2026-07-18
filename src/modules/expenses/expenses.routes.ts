import { Router } from "express";
import { ExpensesController } from "./expenses.controllers";
import { MulterMiddleware } from "../../middlewares/multer.midleware";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserRole } from "../../../generated/prisma";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const multerUploads = new MulterMiddleware(
  ["image/jpeg", "image/png", "image/jpg","application/pdf"],
  "memoryStorage",
).upload(MAX_FILE_SIZE);


router.post("/",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]),multerUploads.array("EXPENSES_IMAGES", 3),ExpensesController.create);
router.get("/",AuthMiddleware.authenticated ,ExpensesController.getAll);
router.get("/:id",AuthMiddleware.authenticated, ExpensesController.getById);
router.patch("/:id",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.ketuaRT]) ,ExpensesController.approve);
router.delete("/:id", AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]),ExpensesController.delete);

export default router;
