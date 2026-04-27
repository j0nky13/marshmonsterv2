import express from "express";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead
} from "../controllers/leads.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireRole("admin", "staff"), getLeads);
router.post("/", requireRole("admin", "staff"), createLead);
router.patch("/:id", requireRole("admin", "staff"), updateLead);
router.delete("/:id", requireRole("admin"), deleteLead);

export default router;