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

app.use((req, res, next) => {
  const origin = req.headers.origin;

  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,x-dev-email");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

function health(req, res) {
  res.json({
    message: "Marsh Monster CRM 2.0 API is running",
    status: "healthy"
  });
}

app.get("/", health);
app.get("/api", health);
app.get("/api/", health);

/*
  Normal local/direct routes:
  /api/auth/me
*/
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

/*
  DigitalOcean routed routes:
  If DO route is /api, it may forward /api/auth/me as /auth/me.
*/
app.use("/auth", authRoutes);
app.use("/leads", leadRoutes);
app.use("/stats", statsRoutes);
app.use("/leadbot", leadbotRoutes);
app.use("/users", userRoutes);
app.use("/commissions", commissionsRoutes);
app.use("/projects", projectsRoutes);
app.use("/files", filesRoutes);
app.use("/messages", messagesRoutes);
app.use("/invoices", invoicesRoutes);

app.use("/uploads", express.static("uploads"));

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});