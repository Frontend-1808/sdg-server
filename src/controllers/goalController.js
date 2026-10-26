import Goal from "../models/Goal.js";
import Article from "../models/Article.js";
import ServiceCard from "../models/ServiceCard.js";
// Faqat shu maydonlarni qabul qilamiz. Boshqa maydon yuborilsa, e'tiborga olinmaydi.
const FIELDS = [
  "number",
  "slug",
  "title",
  "subtitle",
  "shortText",
  "introText",
  "color",
  "iconName",
  "coverImage",
  "template",
  "published",
];

const pick = (body) =>
  Object.fromEntries(
    FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
  );

// Ommaviy sayt uchun
export const listGoals = async (req, res) => {
  const goals = await Goal.find({ published: true }).sort({ number: 1 });
  res.json(goals);
};

export const getGoal = async (req, res) => {
  const goal = await Goal.findOne({ slug: req.params.slug, published: true });
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  res.json(goal);
};

// Admin Panel uchun
export const adminListGoals = async (req, res) => {
  res.json(await Goal.find().sort({ number: 1 }));
};

export const adminGetGoal = async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  res.json(goal);
};

export const createGoal = async (req, res) => {
  const goal = await Goal.create(pick(req.body));
  res.status(201).json(goal);
};

export const updateGoal = async (req, res) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  res.json(goal);
};

export const deleteGoal = async (req, res) => {
  const goal = await Goal.findByIdAndDelete(req.params.id);
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  await Promise.all([
    Article.deleteMany({ goal: goal._id }),
    ServiceCard.deleteMany({ goal: goal._id }),
  ]);
  res.json({ message: "Deleted" });
};
