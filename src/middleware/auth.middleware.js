import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ApiKey from "../models/apikey.model.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) return res.status(401).json({ error: "Missing API key" });

  const keys = await ApiKey.find();

  for (let k of keys) {
    const match = await bcrypt.compare(apiKey, k.key);
    if (match) {
      req.user = k.user;
      k.lastUsed = new Date();
      await k.save();
      return next();
    }
  }

  return res.status(401).json({ error: "Invalid API key" });
};