import { Router } from "express";
import { getSettings } from "../controllers/settingController.js";
import { listDocuments } from "../controllers/documentController.js";
import { getPublicPage } from "../controllers/pageController.js";

const router = Router();

router.get("/settings", getSettings);
router.get("/documents", listDocuments);
router.get("/pages/:slug", getPublicPage);

export default router;
