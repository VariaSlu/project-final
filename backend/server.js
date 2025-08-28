import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import authRouter from "./routes/auth.js";
import "./models/User.js";
import kidsRouter from "./routes/kids.js";
import itemsRouter from "./routes/items.js";
import auth from "./middlewares/auth.js";



dotenv.config(); // 1) Load backend/.env

const app = express();
const PORT = process.env.PORT || 8081;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost/final-project";
//local dev site and hosted frontend
const allowed = [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean);
app.use(cors({ origin: allowed }));

// 2) Middleware
//app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // handy request logs during dev

app.use("/auth", authRouter);

app.use("/kids", kidsRouter);

app.use("/items", itemsRouter);



// 3) Mongo connect (with clear logs)
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Helper: human-readable DB status
const dbStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

// 4) Routes
app.get("/", (_req, res) => {
  res.send("Hello Technigo!");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, db: dbStatus() });
});

app.get("/me", auth, (req, res) => res.json({ userId: req.user.id }));

// 5) Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
