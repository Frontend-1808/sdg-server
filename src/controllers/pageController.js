import Page from "../models/Page.js";
import { cleanArticleHtml } from "../utils/sanitize.js";

const FIELDS = ["slug", "title", "content", "published"];

const pick = (body) => {
  const data = Object.fromEntries(
    FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
  );
  if (typeof data.content === "string")
    data.content = cleanArticleHtml(data.content);
  return data;
};

// Ommaviy sayt uchun
export const getPublicPage = async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, published: true });
  if (!page) return res.status(404).json({ message: "Page not found" });
  res.json(page);
};

// Admin Panel uchun
export const adminListPages = async (req, res) => {
  res.json(await Page.find().select("-content").sort({ createdAt: 1 }));
};

export const adminGetPage = async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ message: "Page not found" });
  res.json(page);
};

export const createPage = async (req, res) => {
  res.status(201).json(await Page.create(pick(req.body)));
};

export const updatePage = async (req, res) => {
  const page = await Page.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!page) return res.status(404).json({ message: "Page not found" });
  res.json(page);
};

export const deletePage = async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ message: "Page not found" });
  if (page.slug === "about") {
    return res
      .status(400)
      .json({
        message:
          "The About us page is linked from the menu and cannot be deleted",
      });
  }
  await page.deleteOne();
  res.json({ message: "Deleted" });
};
