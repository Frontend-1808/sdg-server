import mongoose from "mongoose";

const pair = { _id: false };

const settingSchema = new mongoose.Schema(
  {
    // Faqat bitta hujjat bo'ladi, kaliti main
    key: { type: String, default: "main", unique: true },
    siteName: { type: String, default: "NSUMT" },
    logo: { type: String, default: "https://sdg.nsumt.uz/logo.png" },
    impactLogo: {
      type: String,
      default: "https://sdg.nsumt.uz/img/impactlogo.png",
    },
    impactUrl: {
      type: String,
      default: "https://www.timeshighereducation.com/impactrankings",
    },
    heroTitle: {
      type: String,
      default: "17 Sustainable Development Goals aimed at changing the world",
    },
    heroText: { type: String, default: "" },
    phones: { type: [String], default: [] },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    footerAbout: { type: String, default: "" },
    socials: {
      type: [new mongoose.Schema({ label: String, url: String }, pair)],
      default: [],
    },
    menu: {
      type: [new mongoose.Schema({ label: String, path: String }, pair)],
      default: () => [
        { label: "Home", path: "/" },
        { label: "Document", path: "/documents" },
        { label: "About us", path: "/about" },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Setting", settingSchema);
