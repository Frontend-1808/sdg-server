import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import {
  adminGetGoal,
  adminListGoals,
  createGoal,
  deleteGoal,
  updateGoal,
} from "../controllers/goalController.js";

const router = Router();

router.use(protect, allowRoles("admin", "editor"));

router.get("/", adminListGoals);
router.get("/:id", adminGetGoal);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", allowRoles("admin"), deleteGoal);

export default router;
