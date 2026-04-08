// config/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyAuhR6qosLa7_cMIp_GwCaIbgY_eTuRvXk');
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ TEXT MODEL (for answering)
export const llm = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// ✅ EMBEDDING MODEL (THIS is your embeddingModel)
export const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001"
});