import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  deleteMedia,
  joditUpload,
  listMedia,
  uploadMedia,
} from "../controllers/mediaController.js";

const router = Router();

router.use(protect, allowRoles("admin", "editor"));

router.get("/", listMedia);
router.post("/", upload.array("files", 10), uploadMedia);
router.post("/jodit", upload.array("file", 10), joditUpload);
router.delete("/:id", allowRoles("admin"), deleteMedia);

export default router;
