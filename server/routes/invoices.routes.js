import express from "express";

import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice
} from "../controllers/invoices.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  requireRole("admin", "staff", "customer"),
  getInvoices
);

router.post(
  "/",
  requireRole("admin"),
  createInvoice
);

router.patch(
  "/:id",
  requireRole("admin"),
  updateInvoice
);

router.delete(
  "/:id",
  requireRole("admin"),
  deleteInvoice
);

export default router;