import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "../src/routes/index.js";   // adjust path if needed
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api", routes);   // your internal routes become /api/xxx on Vercel

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

// DB connection (cached)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB Error:", err);
  }
};

// Vercel Serverless Handler
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}