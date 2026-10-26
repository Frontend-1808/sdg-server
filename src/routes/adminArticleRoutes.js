import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import {
  adminGetArticle,
  adminListArticles,
  createArticle,
  deleteArticle,
  updateArticle,
} from "../controllers/articleController.js";

const router = Router();

router.use(protect, allowRoles("admin", "editor"));

router.get("/", adminListArticles);
router.get("/:id", adminGetArticle);
router.post("/", createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", allowRoles("admin"), deleteArticle);

export default router;
