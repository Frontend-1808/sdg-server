import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may contain only letters, digits and hyphens",
      ],
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Page", pageSchema);
