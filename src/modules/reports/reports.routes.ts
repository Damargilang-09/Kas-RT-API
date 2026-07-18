import { Router } from "express";
import { ReportsController } from "./reports.controllers";
import { MulterMiddleware } from "../../middlewares/multer.midleware";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserRole } from "../../../generated/prisma";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const multerUploads = new MulterMiddleware(
  ["image/jpeg", "image/png", "image/jpg","application/pdf"],
  "memoryStorage",
).upload(MAX_FILE_SIZE);

router.get(
  "/dashboard",
  AuthMiddleware.authenticated,
  ReportsController.dashboard,
);
router.post(
  "/",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  multerUploads.single("REPORT_IMAGE"),
  ReportsController.create,
);
router.get("/", AuthMiddleware.authenticated, ReportsController.getAll);
router.get("/:id", AuthMiddleware.authenticated, ReportsController.getById);
router.patch(
  "/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.ketuaRT]),
  ReportsController.approval,
);

router.patch(
  "/resubmission/:id",
  AuthMiddleware.authenticated,
  AuthMiddleware.authorized([UserRole.bendahara]),
  multerUploads.single("REPORT_IMAGE"),
  ReportsController.resubmission,
);

// router.delete(
//   "/:id",
//   AuthMiddleware.authenticated,
//   AuthMiddleware.authorized([UserRole.bendahara]),
//   ReportsController.delete,
// );

export default router;
