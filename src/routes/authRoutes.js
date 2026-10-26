import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many attempts. Try again in 15 minutes." },
});

const router = Router();

router.post("/login", loginLimiter, login);
router.get("/me", protect, me);

export default router;
