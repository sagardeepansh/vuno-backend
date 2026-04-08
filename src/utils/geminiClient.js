// utils/geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient(apiKey) {
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    llm: genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    }),
    embeddingModel: genAI.getGenerativeModel({
      model: "gemini-embedding-001"
    })
  };
}