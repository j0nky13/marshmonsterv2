import express from "express";
import {
  createCommission,
  deleteCommission,
  getCommissions,
  updateCommission
} from "../controllers/commissions.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireRole("admin", "staff"), getCommissions);
router.post("/", requireRole("admin"), createCommission);
router.patch("/:id", requireRole("admin"), updateCommission);
router.delete("/:id", requireRole("admin"), deleteCommission);

export default router;