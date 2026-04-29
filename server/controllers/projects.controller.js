// import Project from "../models/Project.js";
// import Lead from "../models/Lead.js";
// import Commission from "../models/Commission.js";

// function projectPopulate(query) {
//   return query
//     .populate("assignedTo", "name email role")
//     .populate("customerId", "name email role")
//     .populate("leadId", "businessName email phone website");
// }

// export async function getProjects(req, res) {
//   try {
//     const filter = {};

//     if (req.user.role === "staff") {
//       filter.assignedTo = req.user._id;
//     }

//     if (req.user.role === "customer") {
//       filter.customerId = req.user._id;
//     }

//     const projects = await projectPopulate(Project.find(filter)).sort({
//       createdAt: -1
//     });

//     res.json({ projects });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to load projects",
//       error: error.message
//     });
//   }
// }

// export async function createProject(req, res) {
//   try {
//     const project = await Project.create(req.body);

//     const populated = await projectPopulate(Project.findById(project._id));

//     res.status(201).json({
//       project: populated
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Failed to create project",
//       error: error.message
//     });
//   }
// }

// export async function updateProject(req, res) {
//   try {
//     const { id } = req.params;

//     const filter = { _id: id };

//     if (req.user.role === "staff") {
//       filter.assignedTo = req.user._id;
//     }

//     if (req.user.role === "customer") {
//       filter.customerId = req.user._id;
//     }

//     const project = await projectPopulate(
//       Project.findOneAndUpdate(filter, req.body, {
//         new: true,
//         runValidators: true
//       })
//     );

//     if (!project) {
//       return res.status(404).json({
//         message: "Project not found or not allowed"
//       });
//     }

//     res.json({ project });
//   } catch (error) {
//     res.status(400).json({
//       message: "Failed to update project",
//       error: error.message
//     });
//   }
// }

// export async function deleteProject(req, res) {
//   try {
//     const { id } = req.params;

//     const project = await Project.findByIdAndDelete(id);

//     if (!project) {
//       return res.status(404).json({
//         message: "Project not found"
//       });
//     }

//     res.json({
//       message: "Project deleted"
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to delete project",
//       error: error.message
//     });
//   }
// }

// export async function createProjectFromLead(req, res) {
//   try {
//     const { leadId } = req.params;

//     const {
//       projectName,
//       projectType,
//       budget,
//       paidAmount = 0,
//       assignedTo,
//       customerId,
//       dueDate,
//       notes,
//       createCommission = true,
//       commissionRate = 0.5
//     } = req.body;

//     const lead = await Lead.findById(leadId);

//     if (!lead) {
//       return res.status(404).json({
//         message: "Lead not found."
//       });
//     }

//     const finalAssignedTo = assignedTo || lead.assignedTo || req.user._id;

//     const project = await Project.create({
//       clientName: lead.businessName,
//       leadId: lead._id,
//       assignedTo: finalAssignedTo,
//       customerId: customerId || null,
//       status: "planning",
//       projectType,
//       budget: Number(budget || 0),
//       paidAmount: Number(paidAmount || 0),
//       dueDate: dueDate || null,
//       notes: notes || projectName || ""
//     });

//     lead.status = "won";
//     await lead.save();

//     let commission = null;

//     if (createCommission && Number(budget || 0) > 0) {
//       commission = new Commission({
//         userId: finalAssignedTo,
//         leadId: lead._id,
//         clientName: lead.businessName,
//         projectName: projectName || projectType || "Client Project",
//         dealAmount: Number(budget || 0),
//         commissionRate: Number(commissionRate || 0.5),
//         paidCommission: 0,
//         notes: "Auto-created from project conversion."
//       });

//       await commission.save();
//     }

//     const populatedProject = await projectPopulate(Project.findById(project._id));

//     res.status(201).json({
//       project: populatedProject,
//       commission
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Failed to convert lead to project",
//       error: error.message
//     });
//   }
// }


import Project from "../models/Project.js";
import Lead from "../models/Lead.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";

function projectPopulate(query) {
  return query
    .populate("assignedTo", "name email role")
    .populate("customerId", "name email role")
    .populate("leadId", "businessName email phone website");
}

async function findCustomerByLeadEmail(lead) {
  if (!lead?.email) return null;

  const user = await User.findOne({
    email: lead.email.toLowerCase().trim()
  });

  return user?._id || null;
}

export async function getProjects(req, res) {
  try {
    const filter = {};

    if (req.user.role === "staff") {
      filter.assignedTo = req.user._id;
    }

    if (req.user.role === "customer") {
      filter.customerId = req.user._id;
    }

    const projects = await projectPopulate(Project.find(filter)).sort({
      createdAt: -1
    });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load projects",
      error: error.message
    });
  }
}

export async function createProject(req, res) {
  try {
    const project = await Project.create(req.body);

    const populated = await projectPopulate(Project.findById(project._id));

    res.status(201).json({
      project: populated
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create project",
      error: error.message
    });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;

    const filter = { _id: id };

    if (req.user.role === "staff") {
      filter.assignedTo = req.user._id;
    }

    if (req.user.role === "customer") {
      filter.customerId = req.user._id;
    }

    const project = await projectPopulate(
      Project.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true
      })
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found or not allowed"
      });
    }

    res.json({ project });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update project",
      error: error.message
    });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      message: "Project deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete project",
      error: error.message
    });
  }
}

export async function createProjectFromLead(req, res) {
  try {
    const { leadId } = req.params;

    const {
      projectName,
      projectType,
      budget,
      paidAmount = 0,
      assignedTo,
      customerId,
      dueDate,
      notes,
      createCommission = true,
      commissionRate = 0.5
    } = req.body;

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found."
      });
    }

    const finalAssignedTo = assignedTo || lead.assignedTo || req.user._id;

    let finalCustomerId = customerId || null;

    if (!finalCustomerId) {
      finalCustomerId = await findCustomerByLeadEmail(lead);
    }

    const project = await Project.create({
      clientName: lead.businessName,
      leadId: lead._id,
      assignedTo: finalAssignedTo,
      customerId: finalCustomerId,
      status: "planning",
      projectType,
      budget: Number(budget || 0),
      paidAmount: Number(paidAmount || 0),
      dueDate: dueDate || null,
      notes: notes || projectName || ""
    });

    lead.status = "won";
    await lead.save();

    let commission = null;

    if (createCommission && Number(budget || 0) > 0) {
      commission = new Commission({
        userId: finalAssignedTo,
        leadId: lead._id,
        clientName: lead.businessName,
        projectName: projectName || projectType || "Client Project",
        dealAmount: Number(budget || 0),
        commissionRate: Number(commissionRate || 0.5),
        paidCommission: 0,
        notes: "Auto-created from project conversion."
      });

      await commission.save();
    }

    const populatedProject = await projectPopulate(Project.findById(project._id));

    res.status(201).json({
      project: populatedProject,
      commission
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to convert lead to project",
      error: error.message
    });
  }
}