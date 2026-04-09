import mongoose from "mongoose";

const apiLogSchema = new mongoose.Schema({
    apiKeyId: mongoose.Schema.Types.ObjectId,
    endpoint: String,
    status: Number, // 200, 400, 500
    responseTime: Number,
}, { timestamps: true });

export default mongoose.model("ApiLog", apiLogSchema);