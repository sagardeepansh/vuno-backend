import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "../src/routes/index.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());



// ✅ MongoDB connection (cached)
// let isConnected = false;

// const connectDB = async () => {
//     if (isConnected) return;

//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         isConnected = true;
//         console.log("MongoDB Connected");
//     } catch (err) {
//         console.error("DB Error:", err);
//     }
// };

// // ✅ Wrap handler for Vercel
// export default async function handler(req, res) {
//   await connectDB();
//   return app(req, res);
// }

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:Q5ijo6823VV99FPc@cluster0.cs8pize.mongodb.net/vuno', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log('MongoDB connected');

        // Routes
        app.use("/api", routes);

        app.get("/", (req, res) => {
            res.send("Hello from Express on Vercel!");
        });

        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
    }
};

startServer();