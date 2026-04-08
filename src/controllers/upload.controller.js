import axios from "axios";
import FormData from "form-data";
import DocumentModel from "../models/document.model.js";

export const uploadDoc = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      return res.status(400).json({ message: "File required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Send file to OCR API
    const formData = new FormData();
    formData.append("files", file.buffer, file.originalname);

    const ocrResponse = await axios.post(
      "http://devdms.techsaga.live/trace/ocr",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const ocrData = ocrResponse.data;

    // ⚠️ Adjust based on actual response
    const extractedText =
      ocrData?.text ||
      ocrData?.data?.text ||
      JSON.stringify(ocrData);

    if (!extractedText) {
      return res.status(500).json({
        message: "OCR failed to extract text",
      });
    }

    const docId = Date.now().toString();

    // ✅ Save in DB only (NO AI processing)
    const document = await DocumentModel.create({
      userId,
      docId,
      fileName: file.originalname,
      fileType: file.mimetype,
      text: extractedText,
    });

    return res.json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });

  } catch (err) {
    console.error("Upload Error:", err.message);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getDocs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await DocumentModel.find({
      userId,
    });
    return res.json({ data });
  } catch (err) {
    console.error("Get Docs Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const getDocById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await DocumentModel.findById(id);

    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

export const deleteDoc = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDoc = await DocumentModel.findByIdAndDelete(id);

    if (!deletedDoc) {
      return res.status(404).json({
        status: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}