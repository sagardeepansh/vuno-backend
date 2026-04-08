import { getVectors } from "../db/vector.db.js";
import { cosineSimilarity } from "../utils/similarity.js";

// === CONFIG ===
const OLLAMA_URL = "http://localhost:11434";

// Models
const CHAT_MODEL = "llama3";        // or mistral / deepseek
const EMBED_MODEL = "nomic-embed-text"; // best for embeddings

// 🔹 Embedding Function (Ollama)
export const embedText = async (texts) => {
  const results = await Promise.all(
    texts.map(async (text) => {
      const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: EMBED_MODEL,
          prompt: text,
        }),
      });

      const data = await res.json();
      return data.embedding;
    })
  );

  return results;
};

// 🔹 Main RAG Function
export const answerQuery = async (query) => {
  // 1. Embed query
  const [queryEmbedding] = await embedText([query]);

  // 2. Get stored vectors
  const vectors = getVectors();

  // 3. Similarity scoring
  const scored = vectors.map(v => ({
    ...v,
    score: cosineSimilarity(queryEmbedding, v.embedding)
  }));

  // 4. Top chunks
  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = topChunks.map(c => c.text).join("\n\n");

  console.log("context", context);

  // 5. Prompt
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

  // 6. Generate response (Ollama)
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      prompt,
      stream: false,
    }),
  });

  const data = await res.json();

  return {
    answer: data.response,
  };
};