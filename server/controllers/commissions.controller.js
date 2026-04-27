import Commission from "../models/Commission.js";

export async function getCommissions(req, res) {
  try {
    const filter = {};

    if (req.user.role === "staff") {
      filter.userId = req.user._id;
    }

    const commissions = await Commission.find(filter)
      .populate("userId", "name email role")
      .populate("leadId", "businessName email phone website")
      .sort({ createdAt: -1 });

    res.json({ commissions });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load commissions",
      error: error.message
    });
  }
}

export async function createCommission(req, res) {
  try {
    const {
      userId,
      leadId,
      clientName,
      projectName,
      dealAmount,
      commissionRate,
      paidCommission,
      notes
    } = req.body;

    const commission = new Commission({
      userId,
      leadId: leadId || null,
      clientName,
      projectName,
      dealAmount,
      commissionRate,
      paidCommission,
      notes
    });

    await commission.save();

    const populated = await Commission.findById(commission._id)
      .populate("userId", "name email role")
      .populate("leadId", "businessName email phone website");

    res.status(201).json({ commission: populated });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create commission",
      error: error.message
    });
  }
}

export async function updateCommission(req, res) {
  try {
    const { id } = req.params;

    const commission = await Commission.findById(id);

    if (!commission) {
      return res.status(404).json({ message: "Commission not found." });
    }

    const allowed = [
      "clientName",
      "projectName",
      "dealAmount",
      "commissionRate",
      "paidCommission",
      "notes"
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        commission[field] = req.body[field];
      }
    }

    await commission.save();

    const populated = await Commission.findById(commission._id)
      .populate("userId", "name email role")
      .populate("leadId", "businessName email phone website");

    res.json({ commission: populated });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update commission",
      error: error.message
    });
  }
}

export async function deleteCommission(req, res) {
  try {
    const { id } = req.params;

    const commission = await Commission.findByIdAndDelete(id);

    if (!commission) {
      return res.status(404).json({ message: "Commission not found." });
    }

    res.json({ message: "Commission deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete commission",
      error: error.message
    });
  }
}