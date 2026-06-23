import { Router } from "express";
import { UsersController } from "./users.controller";
import { validate } from "../../middlewares/validate.middleware";
import { updateUserSchema, updateUserStatusSchema } from "./users.schema";

const router = Router();

// Sementara sengaja belum dipasang auth middleware supaya partner bisa pakai data user dulu.
// Nanti kalau seed ADMIN sudah siap, bisa tambah: authenticate + authorizeRoles("ADMIN", "BENDAHARA").
router.get("/", UsersController.getAll);
router.get("/:id", UsersController.getById);
router.patch("/:id", validate(updateUserSchema), UsersController.update);
router.patch("/:id/status", validate(updateUserStatusSchema), UsersController.updateStatus);
router.delete("/:id", UsersController.delete);

export default router;
