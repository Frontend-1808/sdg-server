import mongoose from "mongoose";
import ServiceCard from "../models/ServiceCard.js";
import Article from "../models/Article.js";
import Goal from "../models/Goal.js";

const FIELDS = [
  "goal",
  "title",
  "image",
  "linkType",
  "article",
  "externalUrl",
  "order",
  "published",
];

const pick = (body) =>
  Object.fromEntries(
    FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
  );

// Xato matnini qaytaradi. Bo'sh qator bo'lsa, hammasi joyida.
async function checkCard(data) {
  if (!data.goal || !(await Goal.exists({ _id: data.goal })))
    return "Choose a valid goal";
  if (!["article", "external"].includes(data.linkType))
    return "Choose a link type";

  if (data.linkType === "external") {
    data.article = null;
    if (!/^https?:\/\/\S+$/i.test(data.externalUrl || "")) {
      return "External link must start with http:// or https://";
    }
  } else {
    data.externalUrl = "";
    if (!data.article) return "Choose an article";
    const ok = await Article.exists({ _id: data.article, goal: data.goal });
    if (!ok) return "The article does not belong to this goal";
  }
  return "";
}

// Ommaviy sayt uchun
export const listServices = async (req, res) => {
  const goal = await Goal.findOne({ slug: req.params.slug, published: true });
  if (!goal) return res.status(404).json({ message: "Goal not found" });

  const cards = await ServiceCard.find({ goal: goal._id, published: true })
    .sort({ order: 1, createdAt: 1 })
    .populate({ path: "article", select: "slug published" });

  const result = cards
    .filter(
      (c) => c.linkType === "external" || (c.article && c.article.published),
    )
    .map((c) => ({
      _id: c._id,
      title: c.title,
      image: c.image,
      external: c.linkType === "external",
      href:
        c.linkType === "external"
          ? c.externalUrl
          : `/goals/${goal.slug}/${c.article.slug}`,
    }));

  res.json(result);
};

// Admin Panel uchun
export const adminListServices = async (req, res) => {
  const filter = {};
  if (req.query.goal) {
    if (!mongoose.isValidObjectId(req.query.goal)) {
      return res.status(400).json({ message: "Invalid goal id" });
    }
    filter.goal = req.query.goal;
  }
  res.json(
    await ServiceCard.find(filter)
      .sort({ goal: 1, order: 1, createdAt: 1 })
      .populate({ path: "article", select: "title slug" }),
  );
};

export const adminGetService = async (req, res) => {
  const card = await ServiceCard.findById(req.params.id);
  if (!card) return res.status(404).json({ message: "Card not found" });
  res.json(card);
};

export const createService = async (req, res) => {
  const data = pick(req.body);
  const problem = await checkCard(data);
  if (problem) return res.status(400).json({ message: problem });
  res.status(201).json(await ServiceCard.create(data));
};

export const updateService = async (req, res) => {
  const data = pick(req.body);
  const problem = await checkCard(data);
  if (problem) return res.status(400).json({ message: problem });

  const card = await ServiceCard.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!card) return res.status(404).json({ message: "Card not found" });
  res.json(card);
};

export const deleteService = async (req, res) => {
  const card = await ServiceCard.findByIdAndDelete(req.params.id);
  if (!card) return res.status(404).json({ message: "Card not found" });
  res.json({ message: "Deleted" });
};
