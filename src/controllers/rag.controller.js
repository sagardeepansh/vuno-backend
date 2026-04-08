// controllers/rag.controller.js
import axios from "axios";
import FormData from "form-data";
import DocumentModel from "../models/document.model.js";
import { chunkText } from "../utils/chunk.js";
import { embedTexts } from "../services/embedding.service.js";
import { answerQuery } from "../services/rag.service.js";
import { OUTPUT_DIM } from "../services/embedding.service.js";
import { embeddingModel } from "../services/gemini.js";
import mongoose from "mongoose";

export const uploadDoc = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id;

        if (!file) return res.status(400).json({ message: "File required" });

        // OCR
        const formData = new FormData();
        formData.append("files", file.buffer, file.originalname);

        const ocrRes = await axios.post(
            "http://localhost:8000/ocr",
            formData,
            { headers: { ...formData.getHeaders() } }
        );

        const extractedText =
            ocrRes.data?.text ||
            ocrRes.data?.data?.text ||
            "";

        if (!extractedText) {
            return res.status(500).json({ message: "OCR failed" });
        }

        // ✅ Chunk
        const chunks = chunkText(extractedText);

        // ✅ Batch embedding
        const embeddings = await embedTexts(chunks);

        const fileId = Date.now().toString();

        const docs = chunks.map((text, i) => ({
            userId,
            fileId,
            fileName: file.originalname,
            chunkIndex: i,
            text,
            embedding: embeddings[i]
        }));

        // ✅ Bulk insert
        await DocumentModel.insertMany(docs);

        res.json({
            success: true,
            chunks: docs.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const chat = async (req, res) => {
    try {
        const { query } = req.body;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        if (!query) {
            return res.status(400).json({ message: "Query required" });
        }

        // ✅ Embed query
        const result = await embeddingModel.embedContent({
            content: { parts: [{ text: query }] },
            outputDimensionality: 256,
        });

        const queryVector = result.embedding.values;

        // ✅ Mongo Vector Search
        const results = await DocumentModel.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector,
                    numCandidates: 100,
                    limit: 5,
                    filter: {
                        userId: new mongoose.Types.ObjectId(req.user.id)
                    }
                }
            }
        ]);

        const context = results.map(r => r.text).join("\n\n");

        const answer = await answerQuery(query, context);


        res.json({
            answer,
            matches: results.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};