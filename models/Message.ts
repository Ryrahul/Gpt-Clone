import mongoose from "mongoose";

// Message Attachment Schema
const MessageAttachmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true, // Cloudinary URL
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
    pages: {
      type: Number,
      required: false,
    },
    provider: {
      type: String,
      required: true,
      default: "cloudinary",
    },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    // Add attachments array
    attachments: {
      type: [MessageAttachmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
