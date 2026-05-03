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
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/nlp", nlpRoutes);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
