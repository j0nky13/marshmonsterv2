import Project from "../models/Project.js";
import Message from "../models/Message.js";

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

export async function getProjectMessages(req, res) {
  try {
    const { projectId } = req.params;

    const project = await canAccessProject(req.user, projectId);

    if (!project) {
      return res.status(403).json({
        message: "Not allowed to view messages for this project."
      });
    }

    const filter = { projectId };

    if (req.user.role === "customer") {
      filter.visibility = "customer";
    }

    const messages = await Message.find(filter)
      .populate("senderId", "name email role")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load messages",
      error: error.message
    });
  }
}

export async function createProjectMessage(req, res) {
  try {
    const { projectId } = req.params;
    const { body, visibility = "customer" } = req.body;

    const project = await canAccessProject(req.user, projectId);

    if (!project) {
      return res.status(403).json({
        message: "Not allowed to message this project."
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty."
      });
    }

    const finalVisibility =
      req.user.role === "customer" ? "customer" : visibility;

    const message = await Message.create({
      projectId,
      senderId: req.user._id,
      body: body.trim(),
      visibility: finalVisibility,
      readBy: [req.user._id]
    });

    const populated = await Message.findById(message._id).populate(
      "senderId",
      "name email role"
    );

    res.status(201).json({ message: populated });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create message",
      error: error.message
    });
  }
}

export async function deleteProjectMessage(req, res) {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found."
      });
    }

    const project = await canAccessProject(req.user, message.projectId);

    if (!project) {
      return res.status(403).json({
        message: "Not allowed to delete this message."
      });
    }

    const isSender = String(message.senderId) === String(req.user._id);

    if (req.user.role !== "admin" && !isSender) {
      return res.status(403).json({
        message: "Only admins or the sender can delete this message."
      });
    }

    await message.deleteOne();

    res.json({
      message: "Message deleted."
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete message",
      error: error.message
    });
  }
}