import Document from "../models/Document.js";
import Goal from "../models/Goal.js";

const FIELDS = [
  "title",
  "image",
  "fileUrl",
  "goalNumber",
  "order",
  "published",
];
const SAFE_LINK = /^(https?:\/\/|\/)\S*$/i;

const pick = (body) =>
  Object.fromEntries(
    FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
  );

const linkProblem = (data) => {
  if (data.fileUrl && !SAFE_LINK.test(data.fileUrl))
    return "File link must start with http://, https:// or /";
  if (data.image && !SAFE_LINK.test(data.image))
    return "Image link must start with http://, https:// or /";
  return "";
};

// Ommaviy sayt uchun
export const listDocuments = async (req, res) => {
  const docs = await Document.find({ published: true }).sort({
    order: 1,
    createdAt: 1,
  });

  const numbers = [...new Set(docs.map((d) => d.goalNumber).filter(Boolean))];
  const goals = await Goal.find({
    number: { $in: numbers },
    published: true,
  }).select("number slug");
  const slugOf = new Map(goals.map((g) => [g.number, g.slug]));

  res.json(
    docs.map((d) => ({
      _id: d._id,
      title: d.title,
      image: d.image,
      goalNumber: d.goalNumber,
      external: Boolean(d.fileUrl),
      href:
        d.fileUrl ||
        (slugOf.has(d.goalNumber) ? `/goals/${slugOf.get(d.goalNumber)}` : ""),
    })),
  );
};

// Admin Panel uchun
export const adminListDocuments = async (req, res) => {
  res.json(await Document.find().sort({ order: 1, createdAt: 1 }));
};

export const adminGetDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(doc);
};

export const createDocument = async (req, res) => {
  const data = pick(req.body);
  const problem = linkProblem(data);
  if (problem) return res.status(400).json({ message: problem });
  res.status(201).json(await Document.create(data));
};

export const updateDocument = async (req, res) => {
  const data = pick(req.body);
  const problem = linkProblem(data);
  if (problem) return res.status(400).json({ message: problem });

  const doc = await Document.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(doc);
};

export const deleteDocument = async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json({ message: "Deleted" });
};
