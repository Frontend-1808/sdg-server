import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may contain only letters, digits and hyphens",
      ],
    },
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    sourceUrl: { type: String, default: "", index: true },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Bir SDG ichida slug takrorlanmaydi
articleSchema.index({ goal: 1, slug: 1 }, { unique: true });

export default mongoose.model("Article", articleSchema);
