import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import tasksRoutes from "./routes/tasks";
import projectsRoutes from "./routes/projects";
import auditRoutes from "./routes/audit";
import nlpRoutes from "./routes/nlp";

dotenv.config();

const app = express();
// Railway automatically PORT provide karta hai, isliye process.env.PORT hona zaroori hai
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/nlp", nlpRoutes);

// Healthcheck Route: Railway isi route ko check karke 'Green Tick' dega
app.get("/", (req, res) => {
  res.status(200).json({ message: "Team Task Manager Backend is running successfully!" });
});

// CRITICAL FIX: "0.0.0.0" add kiya gaya hai taaki Railway isse publically access kar sake
app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Backend server running on port ${port}`);
});