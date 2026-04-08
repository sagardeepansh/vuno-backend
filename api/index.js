import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "../src/routes/index.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

// ✅ MongoDB connection (cached)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB Error:", err);
  }
};

// ✅ Wrap handler for Vercel
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}