import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Tayyor fayllar shu papkada turadi va saytga /uploads manzili bilan beriladi
export const UPLOAD_DIR = path.resolve(here, "../../uploads");
// Tekshiruvdan o'tmagan fayllar vaqtincha shu papkada turadi
const TMP_DIR = path.resolve(here, "../../tmp");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => cb(null, crypto.randomUUID()),
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
});
