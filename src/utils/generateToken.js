import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "default_secret" , {
    expiresIn: "7d",
  });
};

export const generateApiKey = () => {
  const prefix = "sk_live_";
  const random = crypto.randomBytes(24).toString("hex");
  return prefix + random;
};