import { Router } from "express";
import { PaymentController } from "./payment.controllers";
import { MulterMiddleware } from "../../middlewares/multer.midleware";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserRole } from "../../../generated/prisma";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const multerUploads = new MulterMiddleware(
  ["image/jpeg", "image/png", "image/webp","image/jpg"],'memoryStorage'
).upload(MAX_FILE_SIZE);

router.post("/:billId",multerUploads.single("PAYMENT_IMAGES"),AuthMiddleware.authenticated, PaymentController.create);
router.get("/",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]), PaymentController.getAll);
router.get("/detail/:id", PaymentController.getById);
router.get("/transaction", AuthMiddleware.authenticated,PaymentController.getByUserId)
router.patch("/:id",AuthMiddleware.authenticated,AuthMiddleware.authorized([UserRole.bendahara]), PaymentController.approve);
router.delete("/:id",AuthMiddleware.authenticated, PaymentController.delete);

export default router;
