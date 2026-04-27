import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { apiFetch } from "../api/api";
import ProjectDetailsModal from "../components/projects/ProjectDetailsModal";

const statuses = [
  "planning",
  "in_progress",
  "waiting_client",
  "completed",
  "on_hold"
];

export default function ProjectsTab({ role }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  async function loadProjects() {
    try {
      setLoading(true);
      const data = await apiFetch("/projects");
      setProjects(data.projects || []);
    } catch (error) {
      alert(error.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function updateProject(projectId, updates) {
    const data = await apiFetch(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });

    setProjects((prev) =>
      prev.map((item) => (item._id === projectId ? data.project : item))
    );

    setSelectedProject((prev) =>
      prev?._id === projectId ? data.project : prev
    );
  }

  const grouped = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = projects.filter((project) => project.status === status);
      return acc;
    }, {});
  }, [projects]);

  const totals = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc.budget += project.budget || 0;
        acc.paid += project.paidAmount || 0;
        return acc;
      },
      { budget: 0, paid: 0 }
    );
  }, [projects]);

  if (loading) {
    return <div className="text-zinc-400">Loading projects...</div>;
  }

  const detailsModal = (
    <ProjectDetailsModal
      open={Boolean(selectedProject)}
      project={selectedProject}
      role={role}
      onClose={() => setSelectedProject(null)}
      onUpdate={updateProject}
    />
  );

  if (role === "customer") {
    return (
      <div className="space-y-6">
        {detailsModal}

        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
          <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
            Customer Portal
          </p>

          <h1 className="text-3xl sm:text-5xl font-black mt-2">
            My Projects
          </h1>

          <p className="text-zinc-400 mt-4 max-w-3xl">
            View your active Marsh Monster projects, payment progress, files,
            and current project status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Projects" value={projects.length} />
          <Stat label="Total Budget" value={money(totals.budget)} />
          <Stat label="Paid" value={money(totals.paid)} highlight />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-zinc-500">
              No projects are linked to your account yet.
            </div>
          ) : (
            projects.map((project) => (
              <CustomerProjectCard
                key={project._id}
                project={project}
                onOpen={() => setSelectedProject(project)}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {detailsModal}

      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Operations
        </p>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black">Projects</h1>

            <p className="text-zinc-400 mt-4 max-w-3xl">
              Track client jobs from planning through completion.
            </p>
          </div>

          {role === "admin" && (
            <button className="bg-lime-400 text-black rounded-2xl px-5 py-3 font-bold flex items-center gap-2 opacity-60 cursor-not-allowed">
              <Plus size={18} />
              Add Project Soon
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {statuses.map((status) => (
          <ProjectColumn
            key={status}
            title={status}
            projects={grouped[status] || []}
            onUpdate={updateProject}
            role={role}
            onOpenProject={setSelectedProject}
          />
        ))}
      </div>
    </div>
  );
}

function CustomerProjectCard({ project, onOpen }) {
  const remaining = (project.budget || 0) - (project.paidAmount || 0);

  const progress =
    project.budget > 0
      ? Math.min(Math.round((project.paidAmount / project.budget) * 100), 100)
      : 0;

  return (
    <div
      onClick={onOpen}
      className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5 cursor-pointer hover:border-lime-400/60 transition"
    >
      <div>
        <p className="text-lime-400 text-sm font-semibold capitalize">
          {project.status?.replace("_", " ")}
        </p>

        <h2 className="text-2xl font-black mt-1">{project.clientName}</h2>

        <p className="text-zinc-500 mt-1">
          {project.projectType || "Project"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Mini label="Budget" value={money(project.budget)} />
        <Mini label="Paid" value={money(project.paidAmount)} />
        <Mini label="Remaining" value={money(remaining)} />
      </div>

      <div>
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>Payment Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-3 rounded-full bg-black border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-lime-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {project.notes && (
        <div className="bg-black border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-500 text-sm mb-1">Notes</p>
          <p className="text-zinc-300 line-clamp-3">{project.notes}</p>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Click to view files, payment details, and project info.
      </p>
    </div>
  );
}

function ProjectColumn({ title, projects, onUpdate, role, onOpenProject }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban size={18} className="text-lime-400" />
          <p className="font-black capitalize">{title.replace("_", " ")}</p>
        </div>

        <span className="text-sm text-zinc-500">{projects.length}</span>
      </div>

      <div className="p-4 space-y-3 max-h-[720px] overflow-y-auto">
        {projects.length === 0 ? (
          <p className="text-zinc-500 text-sm">No projects.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onUpdate={onUpdate}
              role={role}
              onOpen={() => onOpenProject(project)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onUpdate, role, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-3 cursor-pointer hover:border-lime-400/60 transition"
    >
      <div>
        <p className="font-bold text-white">{project.clientName}</p>

        <p className="text-xs text-zinc-500">
          {project.projectType || "No type"}
        </p>

        {project.customerId && (
          <p className="text-xs text-lime-400 mt-1">
            Customer: {project.customerId.name || project.customerId.email}
          </p>
        )}
      </div>

      <div className="text-sm text-zinc-400 space-y-1">
        <p>
          Budget: <span className="text-white">{money(project.budget)}</span>
        </p>

        <p>
          Paid:{" "}
          <span className="text-lime-400">{money(project.paidAmount)}</span>
        </p>

        <p>
          Remaining:{" "}
          <span className="text-yellow-300">
            {money((project.budget || 0) - (project.paidAmount || 0))}
          </span>
        </p>
      </div>

      <select
        disabled={role === "customer"}
        value={project.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onUpdate(project._id, { status: e.target.value })}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400 capitalize disabled:opacity-60"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replace("_", " ")}
          </option>
        ))}
      </select>

      {role !== "customer" && (
        <input
          type="number"
          defaultValue={project.paidAmount || 0}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) =>
            onUpdate(project._id, {
              paidAmount: Number(e.target.value)
            })
          }
          placeholder="Paid amount"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400"
        />
      )}

      <p className="text-xs text-zinc-500">Click card for files/details.</p>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p
        className={`text-3xl font-black mt-2 ${
          highlight ? "text-lime-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4">
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}