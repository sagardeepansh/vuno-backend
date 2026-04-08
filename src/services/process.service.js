import { chunkText } from "../utils/chunk.js";
import { embedText } from "./rag.service.js";
import { storeVectors } from "../db/vector.db.js";

export const processDocument = async ({ text, docId }) => {
  const chunks = chunkText(text);

  const embeddings = await embedText(chunks);

  storeVectors({
    docId,
    chunks,
    embeddings
  });
};