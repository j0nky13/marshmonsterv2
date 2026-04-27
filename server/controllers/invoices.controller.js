import Invoice from "../models/Invoice.js";
import Project from "../models/Project.js";

function canAccessProject(user, project) {
  if (!project) return false;

  if (user.role === "admin") return true;

  if (
    user.role === "staff" &&
    String(project.assignedTo) === String(user._id)
  ) {
    return true;
  }

  if (
    user.role === "customer" &&
    String(project.customerId) === String(user._id)
  ) {
    return true;
  }

  return false;
}

export async function getInvoices(req, res) {
  try {
    const filter = {};

    if (req.user.role === "customer") {
      const customerProjects = await Project.find({
        customerId: req.user._id
      }).select("_id");

      filter.projectId = {
        $in: customerProjects.map((project) => project._id)
      };
    }

    if (req.user.role === "staff") {
      const staffProjects = await Project.find({
        assignedTo: req.user._id
      }).select("_id");

      filter.projectId = {
        $in: staffProjects.map((project) => project._id)
      };
    }

    const invoices = await Invoice.find(filter)
      .populate("projectId", "clientName projectType budget paidAmount status")
      .populate("customerId", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load invoices",
      error: error.message
    });
  }
}

export async function createInvoice(req, res) {
  try {
    const {
      projectId,
      customerId,
      title,
      description,
      amount,
      dueDate,
      status = "sent"
    } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({
        message: "Not allowed to create invoice for this project."
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can create invoices."
      });
    }

    if (!title || !amount) {
      return res.status(400).json({
        message: "Invoice title and amount are required."
      });
    }

    const invoice = await Invoice.create({
      projectId,
      customerId: customerId || project.customerId || null,
      createdBy: req.user._id,
      title,
      description,
      amount: Number(amount || 0),
      paidAmount: 0,
      dueDate: dueDate || null,
      status
    });

    const populated = await Invoice.findById(invoice._id)
      .populate("projectId", "clientName projectType budget paidAmount status")
      .populate("customerId", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).json({ invoice: populated });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create invoice",
      error: error.message
    });
  }
}

export async function updateInvoice(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found."
      });
    }

    const project = await Project.findById(invoice.projectId);

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({
        message: "Not allowed to update this invoice."
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can update invoices."
      });
    }

    const allowed = [
      "title",
      "description",
      "amount",
      "paidAmount",
      "dueDate",
      "status"
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    }

    invoice.amount = Number(invoice.amount || 0);
    invoice.paidAmount = Number(invoice.paidAmount || 0);

    if (invoice.paidAmount <= 0) {
      invoice.status = invoice.status === "draft" ? "draft" : "sent";
    } else if (invoice.paidAmount >= invoice.amount) {
      invoice.status = "paid";
    } else {
      invoice.status = "partial";
    }

    await invoice.save();

    // Sync project paid amount from all paid/partial invoices.
    const projectInvoices = await Invoice.find({
      projectId: invoice.projectId
    });

    const totalPaid = projectInvoices.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    await Project.findByIdAndUpdate(invoice.projectId, {
      paidAmount: totalPaid
    });

    const populated = await Invoice.findById(invoice._id)
      .populate("projectId", "clientName projectType budget paidAmount status")
      .populate("customerId", "name email role")
      .populate("createdBy", "name email role");

    res.json({ invoice: populated });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update invoice",
      error: error.message
    });
  }
}

export async function deleteInvoice(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found."
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can delete invoices."
      });
    }

    const projectId = invoice.projectId;

    await invoice.deleteOne();

    const remainingInvoices = await Invoice.find({ projectId });

    const totalPaid = remainingInvoices.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    await Project.findByIdAndUpdate(projectId, {
      paidAmount: totalPaid
    });

    res.json({
      message: "Invoice deleted."
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete invoice",
      error: error.message
    });
  }
}