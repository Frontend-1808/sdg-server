import mongoose from "mongoose";
import Article from "../models/Article.js";
import Goal from "../models/Goal.js";
import ServiceCard from "../models/ServiceCard.js";
import { cleanArticleHtml } from "../utils/sanitize.js";

const FIELDS = [
  "goal",
  "slug",
  "title",
  "summary",
  "content",
  "coverImage",
  "published",
  "order",
];

const pick = (body) => {
  const data = Object.fromEntries(
    FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
  );
  if (typeof data.content === "string")
    data.content = cleanArticleHtml(data.content);
  return data;
};

// Ommaviy sayt uchun
export const getPublicArticle = async (req, res) => {
  const goal = await Goal.findOne({ slug: req.params.slug, published: true });
  if (!goal) return res.status(404).json({ message: "Goal not found" });

  const article = await Article.findOne({
    goal: goal._id,
    slug: req.params.articleSlug,
    published: true,
  });
  if (!article) return res.status(404).json({ message: "Article not found" });

  res.json({
    ...article.toObject(),
    goal: {
      number: goal.number,
      slug: goal.slug,
      color: goal.color,
      title: goal.title,
    },
  });
};

// Admin Panel uchun
export const adminListArticles = async (req, res) => {
  const filter = {};
  if (req.query.goal) {
    if (!mongoose.isValidObjectId(req.query.goal)) {
      return res.status(400).json({ message: "Invalid goal id" });
    }
    filter.goal = req.query.goal;
  }
  res.json(
    await Article.find(filter)
      .select("-content")
      .sort({ order: 1, createdAt: 1 }),
  );
};

export const adminGetArticle = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ message: "Article not found" });
  res.json(article);
};

export const createArticle = async (req, res) => {
  const data = pick(req.body);
  if (!data.goal || !(await Goal.exists({ _id: data.goal }))) {
    return res.status(400).json({ message: "Choose a valid goal" });
  }
  res.status(201).json(await Article.create(data));
};

export const updateArticle = async (req, res) => {
  const data = pick(req.body);
  if (data.goal && !(await Goal.exists({ _id: data.goal }))) {
    return res.status(400).json({ message: "Choose a valid goal" });
  }
  const article = await Article.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!article) return res.status(404).json({ message: "Article not found" });
  res.json(article);
};

export const deleteArticle = async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ message: "Article not found" });
  // Shu maqolaga olib boradigan kartochkalar ham o'chadi
  await ServiceCard.deleteMany({ article: article._id });
  res.json({ message: "Deleted" });
};
