import express from "express";

import {
  createProject,
  createProjectFromLead,
  deleteProject,
  getProjects,
  updateProject
} from "../controllers/projects.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireRole("admin", "staff", "customer"), getProjects);

router.post("/", requireRole("admin"), createProject);

router.post(
  "/from-lead/:leadId",
  requireRole("admin", "staff"),
  createProjectFromLead
);

router.patch("/:id", requireRole("admin", "staff", "customer"), updateProject);

router.delete("/:id", requireRole("admin"), deleteProject);

export default router;