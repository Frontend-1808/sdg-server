import { Router } from "express";
import { getGoal, listGoals } from "../controllers/goalController.js";
import { listServices } from "../controllers/serviceController.js";
import { getPublicArticle } from "../controllers/articleController.js";

const router = Router();

router.get("/", listGoals);
router.get("/:slug/services", listServices);
router.get("/:slug/articles/:articleSlug", getPublicArticle);
router.get("/:slug", getGoal);

export default router;
