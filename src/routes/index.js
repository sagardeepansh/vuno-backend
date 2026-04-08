import express from "express";
import multer from "multer";
import { deleteDoc, getDocById, getDocs } from "../controllers/upload.controller.js";
// import { chat } from "../controllers/chat.controller.js";
import { createKey, deleteKey, getKeys, login, me, meUpdate, signup, verifyOtp } from "../controllers/auth.controller.js";
import { authenticate, validateApiKey } from "../middleware/auth.middleware.js";
import { chat, uploadDoc } from "../controllers/rag.controller.js";

const router = express.Router();
const upload = multer();

router.post("/upload", authenticate, upload.single("file"), uploadDoc);
// router.post("/upload", authenticate, upload.single("file"), uploadDoc);
router.post("/chat", validateApiKey, chat);


router.get("/doc/list", authenticate, getDocs);
router.get("/doc/:id", authenticate, getDocById);
router.delete("/doc/:id", authenticate, deleteDoc);

router.post("/keys", authenticate, createKey);
router.get("/keys", authenticate, getKeys);
router.delete("/keys/:id", authenticate, deleteKey);


router.post("/register", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/user", authenticate, me);
router.put("/user", authenticate, meUpdate);

export default router;