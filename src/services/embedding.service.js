// services/embedding.service.js

// import { embeddingModel } from "./gemini.js";

export const OUTPUT_DIM = 256;

export async function embedTexts(texts, embeddingModel) {
  return Promise.all(
    texts.map(async (text) => {
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: OUTPUT_DIM,
      });

      return result.embedding.values;
    })
  );
}