import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import {
  adminGetPage,
  adminListPages,
  createPage,
  deletePage,
  updatePage,
} from "../controllers/pageController.js";

const router = Router();

router.use(protect, allowRoles("admin", "editor"));

router.get("/", adminListPages);
router.get("/:id", adminGetPage);
router.post("/", createPage);
router.put("/:id", updatePage);
router.delete("/:id", allowRoles("admin"), deletePage);

export default router;
