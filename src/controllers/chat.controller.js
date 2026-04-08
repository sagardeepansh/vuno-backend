import documentModel from "../models/document.model.js";
import { answerQuery } from "../services/rag.service-old.js";

export const chat = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

    console.log("Received query:", query);
    console.log("User ID:", req.user);
    
    const getDoc = await documentModel.find({
      userId: req.user
    })
    console.log('getDoc', getDoc)

    // const result = await answerQuery(query);

    // res.json(result);
    res.json({ answer: "This is a sample response." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};