import mongoose from "mongoose";

const serviceCardSchema = new mongoose.Schema(
  {
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    linkType: {
      type: String,
      enum: ["article", "external"],
      default: "article",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      default: null,
    },
    externalUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("ServiceCard", serviceCardSchema);
