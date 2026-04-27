import express from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/dashboard",
  requireRole("admin", "staff", "customer"),
  getDashboardStats
);

export default router;