import { Router } from "express";
import { ReportsController } from "./reports.controllers";
import { MulterMiddleware } from "../../middlewares/multer.midleware";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const multerUploads = new MulterMiddleware(
  ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  "memoryStorage",
).upload(MAX_FILE_SIZE);

router.get("/dashboard", ReportsController.dashboard);
router.post(
  "/",
  multerUploads.single("REPORT_IMAGE"),
  ReportsController.create,
);
router.get("/",ReportsController.getAll)
router.get("/:id",ReportsController.getById)
router.patch("/:id",ReportsController.approval)
router.delete("/:id",ReportsController.delete)

export default router;
