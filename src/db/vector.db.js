let DB = [];

export const storeVectors = ({ docId, chunks, embeddings }) => {
  chunks.forEach((chunk, i) => {
    DB.push({
      id: `${docId}_${i}`,
      text: chunk,
      embedding: embeddings[i],
      docId
    });
  });
};

export const getVectors = () => DB;