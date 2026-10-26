import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import {
  adminGetDocument,
  adminListDocuments,
  createDocument,
  deleteDocument,
  updateDocument,
} from "../controllers/documentController.js";

const router = Router();

router.use(protect, allowRoles("admin", "editor"));

router.get("/", adminListDocuments);
router.get("/:id", adminGetDocument);
router.post("/", createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", allowRoles("admin"), deleteDocument);

export default router;
