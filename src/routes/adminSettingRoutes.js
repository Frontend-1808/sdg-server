import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingController.js";

const router = Router();

router.use(protect, allowRoles("admin"));

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
