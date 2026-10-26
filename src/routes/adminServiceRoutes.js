import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import {
  adminGetService,
  adminListServices,
  createService,
  deleteService,
  updateService,
} from "../controllers/serviceController.js";

const router = Router();

router.use(protect, allowRoles("admin", "editor"));

router.get("/", adminListServices);
router.get("/:id", adminGetService);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", allowRoles("admin"), deleteService);

export default router;
