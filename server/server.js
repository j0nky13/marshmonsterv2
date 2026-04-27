import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import statsRoutes from "./routes/stats.routes.js";
import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/leads.routes.js";
import leadbotRoutes from "./routes/leadbot.routes.js";
import userRoutes from "./routes/users.routes.js";
import commissionsRoutes from "./routes/commissions.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import filesRoutes from "./routes/files.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";

// dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Marsh Monster CRM 2.0 API is running",
    status: "healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/leadbot", leadbotRoutes);
app.use("/api/users", userRoutes);
app.use("/api/commissions", commissionsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/invoices", invoicesRoutes);

app.use("/api/files", filesRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/messages", messagesRoutes);

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});