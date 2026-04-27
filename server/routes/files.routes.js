import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  deleteProjectFile,
  getProjectFiles,
  uploadProjectFile
} from "../controllers/files.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

const uploadDir = "uploads/project-files";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.use(authMiddleware);

router.get(
  "/project/:projectId",
  requireRole("admin", "staff", "customer"),
  getProjectFiles
);

router.post(
  "/project/:projectId",
  requireRole("admin", "staff", "customer"),
  upload.single("file"),
  uploadProjectFile
);

router.delete(
  "/:fileId",
  requireRole("admin", "staff", "customer"),
  deleteProjectFile
);

export default router;