import express from "express";

import {
  createContactRequest,
  getContactRequests,
  updateContactRequest,
  convertContactToLead
} from "../controllers/contact.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", createContactRequest);

router.get(
  "/",
  authMiddleware,
  requireRole("admin", "staff"),
  getContactRequests
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin", "staff"),
  updateContactRequest
);

router.post(
  "/:id/convert",
  authMiddleware,
  requireRole("admin", "staff"),
  convertContactToLead
);

export default router;