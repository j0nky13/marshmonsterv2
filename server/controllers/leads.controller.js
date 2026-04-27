import Lead from "../models/Lead.js";

export async function getLeads(req, res) {
  try {
    const filter = {};

    if (req.user.role === "staff") {
      filter.assignedTo = req.user._id;
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json({ leads });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leads",
      error: error.message
    });
  }
}

export async function createLead(req, res) {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id
    });

    res.status(201).json({ lead });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create lead",
      error: error.message
    });
  }
}

export async function updateLead(req, res) {
  try {
    const { id } = req.params;

    const filter = { _id: id };

    if (req.user.role === "staff") {
      filter.assignedTo = req.user._id;
    }

    const lead = await Lead.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found or not allowed"
      });
    }

    res.json({ lead });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update lead",
      error: error.message
    });
  }
}

export async function deleteLead(req, res) {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete lead",
      error: error.message
    });
  }
}