import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    name: String,
    key: String, // hashed
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastUsed: Date,
  },
  { timestamps: true }
);

export default mongoose.model("ApiKey", apiKeySchema);