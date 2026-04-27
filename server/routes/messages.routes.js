import express from "express";

import {
  createProjectMessage,
  deleteProjectMessage,
  getProjectMessages
} from "../controllers/messages.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/project/:projectId",
  requireRole("admin", "staff", "customer"),
  getProjectMessages
);

router.post(
  "/project/:projectId",
  requireRole("admin", "staff", "customer"),
  createProjectMessage
);

router.delete(
  "/:messageId",
  requireRole("admin", "staff", "customer"),
  deleteProjectMessage
);

export default router;