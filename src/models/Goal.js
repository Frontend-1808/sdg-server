import mongoose from "mongoose";

const i18n = () => ({
  en: { type: String, default: "" },
  uz: { type: String, default: "" },
  ru: { type: String, default: "" },
});

const goalSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true, min: 1 },
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
    title: i18n(),
    subtitle: i18n(),
    shortText: i18n(),
    introText: i18n(),
    color: {
      type: String,
      default: "#334155",
      match: [/^#[0-9a-fA-F]{6}$/, "Color must look like #1A2B3C"],
    },
    iconName: { type: String, default: "Star" },
    coverImage: { type: String, default: "" },
    template: { type: String, enum: ["simple", "services"], default: "simple" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Goal", goalSchema);
