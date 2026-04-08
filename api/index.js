import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "../src/routes/index.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

// mongoose
//   .connect('mongodb://127.0.0.1:27017/vuno')
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error(err));
mongoose
    .connect('mongodb+srv://admin:Q5ijo6823VV99FPc@cluster0.cs8pize.mongodb.net/vuno')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error(err));

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});