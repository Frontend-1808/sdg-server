import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileTypeFromFile } from "file-type";
import Media from "../models/Media.js";
import { UPLOAD_DIR } from "../middleware/upload.js";

const MB = 1024 * 1024;

const ALLOWED = {
  jpg: { kind: "image", max: 5 * MB },
  png: { kind: "image", max: 5 * MB },
  webp: { kind: "image", max: 5 * MB },
  gif: { kind: "image", max: 5 * MB },
  pdf: { kind: "document", max: 50 * MB },
  docx: { kind: "document", max: 50 * MB },
  xlsx: { kind: "document", max: 50 * MB },
  pptx: { kind: "document", max: 50 * MB },
  mp4: { kind: "video", max: 50 * MB },
  webm: { kind: "video", max: 50 * MB },
};

// Brauzer nomni latin1 deb yuboradi. Uni UTF8 ga qaytaramiz va tozalaymiz.
const cleanName = (name = "") =>
  path
    .basename(Buffer.from(name, "latin1").toString("utf8"))
    .replace(/[^\p{L}\p{N}._ ()-]/gu, "")
    .slice(0, 150) || "file";

async function saveFiles(files = [], userId) {
  const items = [];
  const errors = [];

  for (const file of files) {
    const name = cleanName(file.originalname);
    let finalPath = null;
    try {
      const type = await fileTypeFromFile(file.path);
      const rule = type && ALLOWED[type.ext];

      if (!rule) throw new Error("This file type is not allowed");
      if (file.size > rule.max)
        throw new Error(`File is larger than ${rule.max / MB} MB`);

      const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${type.ext}`;
      finalPath = path.join(UPLOAD_DIR, filename);
      await fs.rename(file.path, finalPath);

      const doc = await Media.create({
        url: `/uploads/${filename}`,
        filename,
        originalName: name,
        mimeType: type.mime,
        kind: rule.kind,
        size: file.size,
        uploadedBy: userId,
      });
      items.push(doc);
    } catch (err) {
      await fs.rm(file.path, { force: true });
      if (finalPath) await fs.rm(finalPath, { force: true });
      errors.push(`${name}: ${err.message}`);
    }
  }

  return { items, errors };
}

export const listMedia = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 24;
  const filter = {};
  if (["image", "video", "document"].includes(req.query.kind))
    filter.kind = req.query.kind;

  const [items, total] = await Promise.all([
    Media.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Media.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
  });
};

export const uploadMedia = async (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ message: "No file received" });

  const { items, errors } = await saveFiles(req.files, req.user._id);

  if (!items.length)
    return res.status(400).json({ message: errors.join(". "), errors });
  res.status(201).json({ items, errors });
};

// Jodit editor kutadigan javob shakli
export const joditUpload = async (req, res) => {
  const { items, errors } = await saveFiles(req.files || [], req.user._id);

  if (!items.length) {
    return res.status(400).json({
      success: false,
      data: {
        messages: errors.length ? errors : ["No file received"],
        code: 400,
      },
    });
  }

  res.json({
    success: true,
    data: {
      baseurl: "",
      messages: errors,
      files: items.map((m) => m.url),
      isImages: items.map((m) => m.kind === "image"),
      code: 220,
    },
  });
};

export const deleteMedia = async (req, res) => {
  const doc = await Media.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "File not found" });

  await fs.rm(path.join(UPLOAD_DIR, path.basename(doc.filename)), {
    force: true,
  });
  await doc.deleteOne();
  res.json({ message: "Deleted" });
};
