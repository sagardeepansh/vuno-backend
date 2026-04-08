export async function answerQuery(query, context, llm) {
  try {
    if (!context || context.trim().length === 0) {
      return "Not in document";
    }

    const prompt = `
You are an intelligent document assistant.

Use the provided context to answer clearly.

Rules:
- Use context as primary source
- You may summarize or infer
- Do not copy blindly
- If partially available → answer what you can
- If completely missing → reply exactly: "Not in document"

Context:
${context}
 
Question:
${query}
`;

    const response = await llm.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const answer =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Not in document";

    return answer.trim();

  } catch (err) {
    console.error("RAG Answer Error:", err.message);
    return "Error generating response";
  }
}