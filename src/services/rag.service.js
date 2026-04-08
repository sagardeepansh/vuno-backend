// services/rag.service.js

import { llm } from "./gemini.js";

export async function answerQuery(query, context) {
  //   const prompt = `
  // You are an AI assistant.

  // Answer ONLY from the context.
  // If answer is not present, say "I don't know".

  // Context:
  // ${context}

  // Question:
  // ${query}
  // `;

  const prompt = `
You are an intelligent document assistant.

Use the provided context to understand the topic and answer the question clearly and accurately.

Guidelines:
- Base your answer primarily on the context.
- You may rephrase, summarize, or infer meaning where appropriate.
- Do NOT copy text blindly—respond naturally.
- If the answer is partially available, answer with what you know.
- If the answer is completely missing, reply exactly: "Not in document".

Context:
${context}

Question:
${query}
`;

  const response = await llm.generateContent(prompt);
  const answer = response.response.text();

  return answer;
}