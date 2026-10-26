import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    // 0 bo'lsa umumiy hujjat, 1 dan 18 gacha bo'lsa shu SDG ga tegishli
    goalNumber: { type: Number, default: 0, min: 0, max: 99 },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Document", documentSchema);
