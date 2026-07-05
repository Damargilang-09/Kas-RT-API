import { Router } from "express";
import { PaymentController } from "./payment.controllers";
import { MulterMiddleware } from "../../middlewares/multer.midleware";

const router = Router();

const MAX_FILE_SIZE = 6 * 1024 * 1024;
const multerUploads = new MulterMiddleware(
  ["image/jpeg", "image/png", "image/webp","image/jpg"],'memoryStorage'
).upload(MAX_FILE_SIZE);

router.post("/:billId",multerUploads.single("PAYMENT_IMAGES"), PaymentController.create);
router.get("/", PaymentController.getAll);
router.get("/detail/:id", PaymentController.getById);
router.get("/:userId", PaymentController.getByUserId)
router.patch("/:id", PaymentController.update);
router.delete("/:id", PaymentController.delete);

export default router;
