import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    gkey: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: { type: Boolean, default: false },
    whitelistDomains: [String],

    otp: String,
    otpExpiry: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);