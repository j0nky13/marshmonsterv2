import ContactRequest from "../models/ContactRequest.js";
import Lead from "../models/Lead.js";

export async function createContactRequest(req, res) {
  try {
    const request = await ContactRequest.create(req.body);

    res.status(201).json({ request });
  } catch (error) {
    res.status(400).json({
      message: "Failed to submit contact request",
      error: error.message
    });
  }
}

export async function getContactRequests(req, res) {
  try {
    const requests = await ContactRequest.find({})
      .populate("convertedLeadId", "businessName email phone status")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load contact requests",
      error: error.message
    });
  }
}

export async function updateContactRequest(req, res) {
  try {
    const request = await ContactRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Contact request not found." });
    }

    res.json({ request });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update contact request",
      error: error.message
    });
  }
}

export async function convertContactToLead(req, res) {
  try {
    const request = await ContactRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Contact request not found." });
    }

    const lead = await Lead.create({
      businessName: request.businessName || request.name || "New Contact Lead",
      website: request.website || "",
      email: request.email || "",
      phone: request.phone || "",
      category: "Contact Form",
      source: "contact_form",
      status: "new",
      assignedTo: req.user._id,
      createdBy: req.user._id,
      notes: request.message || ""
    });

    request.status = "converted";
    request.convertedLeadId = lead._id;
    await request.save();

    res.status(201).json({ request, lead });
  } catch (error) {
    res.status(400).json({
      message: "Failed to convert contact request",
      error: error.message
    });
  }
}