import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import StatCard from "../components/shared/StatCard";

export default function OverviewTab({ user, role }) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    followUps: 0,
    wonLeads: 0,
    lostLeads: 0,
    openDeals: 0,
    revenue: 0,
    projectCount: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    paidAmount: 0,
    outstandingBalance: 0,
    totalCommission: 0,
    paidCommission: 0,
    outstandingCommission: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await apiFetch("/stats/dashboard");
        setStats((prev) => ({
          ...prev,
          ...(data.stats || {})
        }));
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    window.addEventListener("focus", loadStats);

    return () => {
      window.removeEventListener("focus", loadStats);
    };
  }, []);

  const copy = getOverviewCopy(role);
  const cards = getCardsForRole(role, stats);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 sm:p-8">
        <p className="text-lime-400 font-semibold uppercase tracking-widest text-xs">
          {copy.eyebrow}
        </p>

        <h1 className="text-3xl sm:text-5xl font-black mt-3">
          {copy.title(user)}
        </h1>

        <p className="text-zinc-400 mt-4 max-w-2xl">
          {copy.description}
        </p>
      </div>

      {loading ? (
        <div className="text-zinc-400">Loading dashboard stats...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.primary.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {cards.secondary.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function getOverviewCopy(role) {
  if (role === "customer") {
    return {
      eyebrow: "Customer Portal",
      title: (user) => `Welcome back, ${user?.name || user?.email}!`,
      description:
        "View your Marsh Monster projects, project status, payment progress, and upcoming client-side actions."
    };
  }

  if (role === "staff") {
    return {
      eyebrow: "Staff Workspace",
      title: (user) => `Welcome back, ${user?.name || user?.email}!`,
      description:
        "Track your assigned leads, follow-ups, wins, commissions, and active client work."
    };
  }

  return {
    eyebrow: "Admin Command Center",
    title: (user) => `Welcome back, ${user?.name || user?.email}!`,
    description:
      "Manage leads, staff, projects, commissions, marketing stats, and Marsh Monster operations from one dashboard."
  };
}

function getCardsForRole(role, stats) {
  if (role === "customer") {
    return {
      primary: [
        { label: "My Projects", value: stats.projectCount || 0 },
        { label: "Active Projects", value: stats.activeProjects || 0 },
        { label: "Completed", value: stats.completedProjects || 0 },
        { label: "Balance Due", value: money(stats.outstandingBalance || 0) }
      ],
      secondary: [
        { label: "Total Project Budget", value: money(stats.totalBudget || 0) },
        { label: "Paid So Far", value: money(stats.paidAmount || 0) },
        { label: "Next Step", value: stats.activeProjects > 0 ? "In Progress" : "None" }
      ]
    };
  }

  if (role === "staff") {
    return {
      primary: [
        { label: "My Leads", value: stats.totalLeads || 0 },
        { label: "My Wins", value: stats.wonLeads || 0 },
        { label: "Follow-Ups", value: stats.followUps || 0 },
        { label: "Outstanding Commission", value: money(stats.outstandingCommission || 0) }
      ],
      secondary: [
        { label: "New Leads", value: stats.newLeads || 0 },
        { label: "Contacted", value: stats.contactedLeads || 0 },
        { label: "Paid Commission", value: money(stats.paidCommission || 0) }
      ]
    };
  }

  return {
    primary: [
      { label: "Total Leads", value: stats.totalLeads || 0 },
      { label: "Open Deals", value: stats.openDeals || 0 },
      { label: "Follow-Ups", value: stats.followUps || 0 },
      { label: "Revenue", value: money(stats.revenue || 0) }
    ],
    secondary: [
      { label: "New Leads", value: stats.newLeads || 0 },
      { label: "Contacted", value: stats.contactedLeads || 0 },
      { label: "Won Leads", value: stats.wonLeads || 0 }
    ]
  };
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}