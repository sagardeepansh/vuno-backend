import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    // 🔐 Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📄 Unique document identifier (your custom id)
    docId: {
      type: String,
      // required: true,
      unique: true,
    },

    // 📁 File metadata
    fileName: {
      type: String,
      // required: true,
    },
    fileType: {
      type: String,
      // required: true,
    },
    fileSize: {
      type: Number, // in bytes
    },

    // 🧠 Extracted text (OCR output)
    text: {
      type: String,
      required: true,
    },

    chunkIndex: Number,

    embedding: {
      type: [Number],
      // required: true
    },

    // 📊 Status (useful for UI)
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// 🔍 Text search index (important for later AI/search)
documentSchema.index({ text: "text" });

// 📦 Export
export default mongoose.model("Document", documentSchema);