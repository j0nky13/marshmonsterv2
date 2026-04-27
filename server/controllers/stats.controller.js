import Lead from "../models/Lead.js";
import Project from "../models/Project.js";
import Commission from "../models/Commission.js";

export async function getDashboardStats(req, res) {
  try {
    const role = req.user.role;

    const leadFilter = {};
    const projectFilter = {};
    const commissionFilter = {};

    /*
      STAFF
    */

    if (role === "staff") {
      leadFilter.assignedTo = req.user._id;

      projectFilter.assignedTo = req.user._id;

      commissionFilter.userId = req.user._id;
    }

    /*
      CUSTOMER
    */

    if (role === "customer") {
      projectFilter.customerId = req.user._id;
    }

    const [
      leads,
      projects,
      commissions
    ] = await Promise.all([
      role === "customer"
        ? Promise.resolve([])
        : Lead.find(leadFilter),

      Project.find(projectFilter),

      role === "customer"
        ? Promise.resolve([])
        : Commission.find(commissionFilter)
    ]);

    /*
      LEAD STATS
    */

    const totalLeads = leads.length;

    const newLeads = leads.filter(
      (lead) => lead.status === "new"
    ).length;

    const contactedLeads = leads.filter(
      (lead) => lead.status === "contacted"
    ).length;

    const followUps = leads.filter(
      (lead) =>
        lead.nextFollowUpAt &&
        !["won", "lost", "archived"].includes(lead.status)
    ).length;

    const wonLeads = leads.filter(
      (lead) => lead.status === "won"
    ).length;

    const lostLeads = leads.filter(
      (lead) => lead.status === "lost"
    ).length;

    /*
      PROJECT STATS
    */

    const projectCount = projects.length;

    const activeProjects = projects.filter((project) =>
      ["planning", "in_progress", "waiting_client"].includes(
        project.status
      )
    ).length;

    const completedProjects = projects.filter(
      (project) => project.status === "completed"
    ).length;

    const totalBudget = projects.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );

    const paidAmount = projects.reduce(
      (sum, project) => sum + (project.paidAmount || 0),
      0
    );

    const outstandingBalance = Math.max(
      totalBudget - paidAmount,
      0
    );

    /*
      COMMISSIONS
    */

    const totalCommission = commissions.reduce(
      (sum, item) => sum + (item.totalCommission || 0),
      0
    );

    const paidCommission = commissions.reduce(
      (sum, item) => sum + (item.paidCommission || 0),
      0
    );

    const outstandingCommission = commissions.reduce(
      (sum, item) =>
        sum + (item.outstandingCommission || 0),
      0
    );

    /*
      ADMIN ONLY
    */

    const revenue =
      role === "admin"
        ? totalBudget
        : 0;

    const openDeals =
      role === "admin"
        ? activeProjects
        : wonLeads;

    res.json({
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        followUps,
        wonLeads,
        lostLeads,

        openDeals,
        revenue,

        projectCount,
        activeProjects,
        completedProjects,

        totalBudget,
        paidAmount,
        outstandingBalance,

        totalCommission,
        paidCommission,
        outstandingCommission
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard stats",
      error: error.message
    });
  }
}