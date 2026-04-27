import fs from "fs";
import Project from "../models/Project.js";
import ProjectFile from "../models/ProjectFile.js";

async function canAccessProject(user, projectId) {
  const project = await Project.findById(projectId);

  if (!project) return null;

  if (user.role === "admin") return project;

  if (
    user.role === "staff" &&
    String(project.assignedTo) === String(user._id)
  ) {
    return project;
  }

  if (
    user.role === "customer" &&
    String(project.customerId) === String(user._id)
  ) {
    return project;
  }

  return null;
}

export async function uploadProjectFile(req, res) {
  try {
    const { projectId } = req.params;

    const project = await canAccessProject(req.user, projectId);

    if (!project) {
      return res.status(403).json({
        message: "Not allowed to upload files for this project."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded."
      });
    }

    const file = await ProjectFile.create({
      projectId,
      uploadedBy: req.user._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      visibility: req.body.visibility || "customer"
    });

    const populated = await ProjectFile.findById(file._id).populate(
      "uploadedBy",
      "name email role"
    );

    res.status(201).json({ file: populated });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload file",
      error: error.message
    });
  }
}

export async function getProjectFiles(req, res) {
  try {
    const { projectId } = req.params;

    const project = await canAccessProject(req.user, projectId);

    if (!project) {
      return res.status(403).json({
        message: "Not allowed to view files for this project."
      });
    }

    const filter = { projectId };

    if (req.user.role === "customer") {
      filter.visibility = "customer";
    }

    const files = await ProjectFile.find(filter)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load files",
      error: error.message
    });
  }
}

export async function deleteProjectFile(req, res) {
  try {
    const { fileId } = req.params;

    const file = await ProjectFile.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const project = await canAccessProject(req.user, file.projectId);

    if (!project) {
      return res.status(403).json({
        message: "Not allowed to delete this file."
      });
    }

    if (
      req.user.role !== "admin" &&
      String(file.uploadedBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Only admins or the uploader can delete this file."
      });
    }

    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();

    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete file",
      error: error.message
    });
  }
}