import express from "express";
import {
  rateWebsite,
  saveLeadBotResults,
  searchLeads
} from "../controllers/leadbot.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/search", requireRole("admin", "staff"), searchLeads);
router.post("/save", requireRole("admin", "staff"), saveLeadBotResults);
router.post("/rate", requireRole("admin", "staff"), rateWebsite);

export default router;