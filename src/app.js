import express from "express";
import cors from "cors";
import goalRoutes from "./routes/goalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminGoalRoutes from "./routes/adminGoalRoutes.js";
import adminMediaRoutes from "./routes/adminMediaRoutes.js";
import { UPLOAD_DIR } from "./middleware/upload.js";
import adminArticleRoutes from "./routes/adminArticleRoutes.js";
import adminServiceRoutes from "./routes/adminServiceRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminSettingRoutes from "./routes/adminSettingRoutes.js";
import adminDocumentRoutes from "./routes/adminDocumentRoutes.js";
import adminPageRoutes from "./routes/adminPageRoutes.js";
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    maxAge: "7d",
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  }),
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", publicRoutes);
app.use("/api/admin/settings", adminSettingRoutes);
app.use("/api/admin/documents", adminDocumentRoutes);
app.use("/api/admin/pages", adminPageRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/goals", adminGoalRoutes);
app.use("/api/admin/media", adminMediaRoutes);
app.use("/api/admin/articles", adminArticleRoutes);
app.use("/api/admin/services", adminServiceRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large (50 MB maximum)"
        : err.message;
    return res.status(400).json({ message });
  }
  if (err.name === "ValidationError")
    return res.status(400).json({ message: err.message });
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid id" });
  if (err.code === 11000)
    return res.status(409).json({ message: "Value already exists" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
