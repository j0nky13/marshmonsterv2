// import "dotenv/config";
// import express from "express";
// import cors from "cors";

// import { connectDB } from "./config/db.js";

// import statsRoutes from "./routes/stats.routes.js";
// import authRoutes from "./routes/auth.routes.js";
// import leadRoutes from "./routes/leads.routes.js";
// import leadbotRoutes from "./routes/leadbot.routes.js";
// import userRoutes from "./routes/users.routes.js";
// import commissionsRoutes from "./routes/commissions.routes.js";
// import projectsRoutes from "./routes/projects.routes.js";
// import filesRoutes from "./routes/files.routes.js";
// import messagesRoutes from "./routes/messages.routes.js";
// import invoicesRoutes from "./routes/invoices.routes.js";

// const app = express();

// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   "https://marsh.monster",
//   "https://www.marsh.monster",
//   "http://localhost:5173"
// ].filter(Boolean);

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error(`CORS blocked origin: ${origin}`));
//     },
//     credentials: true
//   })
// );

// app.use(express.json({ limit: "10mb" }));

// app.get("/", (req, res) => {
//   res.json({
//     message: "Marsh Monster CRM 2.0 API is running",
//     status: "healthy"
//   });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/leads", leadRoutes);
// app.use("/api/stats", statsRoutes);
// app.use("/api/leadbot", leadbotRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/commissions", commissionsRoutes);
// app.use("/api/projects", projectsRoutes);
// app.use("/api/files", filesRoutes);
// app.use("/api/messages", messagesRoutes);
// app.use("/api/invoices", invoicesRoutes);

// app.use("/uploads", express.static("uploads"));

// const PORT = process.env.PORT || 5050;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });

import "dotenv/config";
import express from "express";
import cors from "cors";

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

const app = express();

app.use(
  cors({
    origin: true,
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
app.use("/api/files", filesRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/invoices", invoicesRoutes);

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});