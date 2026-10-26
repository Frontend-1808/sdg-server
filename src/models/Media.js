import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true, unique: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, required: true },
    kind: {
      type: String,
      enum: ["image", "video", "document"],
      required: true,
    },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Media", mediaSchema);
