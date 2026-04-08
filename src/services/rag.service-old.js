import { GoogleGenerativeAI } from "@google/generative-ai";
import { getVectors } from "../db/vector.db.js";
import { cosineSimilarity } from "../utils/similarity.js";

// ✅ Fix: Use environment variable correctly (no quotes around process.env)
const genAI = new GoogleGenerativeAI('AIzaSyAuhR6qosLa7_cMIp_GwCaIbgY_eTuRvXk');

console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

// === Embedding Model (Recommended in 2026) ===
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",        // Stable & reliable (text-only)
  // model: "gemini-embedding-2-preview", // Latest multimodal (if you need images/PDFs later)
});

// Optional: Reduce dimensions using Matryoshka (recommended for most cases)
const OUTPUT_DIM = 768;   // Change to 1536 or 3072 if you want higher quality

// === Chat Model ===
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",          // or "gemini-2.0-flash" if available
});

// 🔹 Improved Embedding Function
export const embedText = async (texts) => {
  const results = await Promise.all(
    texts.map(async (text) => {
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        // Reduce dimensions for compatibility & lower storage cost
        outputDimensionality: OUTPUT_DIM,
      });

      return result.embedding.values;
    })
  );

  return results; // Array of number[] (embeddings)
};

// 🔹 Main RAG Function
export const answerQuery = async (query) => {
  // 1. Generate embedding for the query
  const [queryEmbedding] = await embedText([query]);

  // 2. Get stored vectors from DB
  const vectors = getVectors(); // Make sure this returns [{ text, embedding, ... }]

  // console.log('vectors', vectors)

  // 3. Calculate similarity scores
  const scored = vectors.map(v => ({
    ...v,
    score: cosineSimilarity(queryEmbedding, v.embedding)
  }));

  // 4. Retrieve top 5 most relevant chunks
  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = topChunks.map(c => c.text).join("\n\n");

  // console.log('context', context)

  // 5. Build prompt
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

  // 6. Generate answer
  const result = await chatModel.generateContent(prompt);
  const answer = result.response.text();

  return {
    answer,
    // sources: topChunks.map(({ text, score, ...rest }) => ({
    //   ...rest,
    //   score: Number(score.toFixed(4)), // cleaner output
    // })),
  };
};