import { useEffect, useMemo, useState } from "react";
import { listProjects } from "../lib/projectsApi";
import { listMessages } from "../../../lib/messagesApi";

import StatsChart from "../components/StatsChart";
import { groupByDay } from "../lib/stats.chart.utils";

const TABS = ["overview", "revenue", "forecast", "leads", "export"];

export default function Stats() {
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    async function load() {
      try {
        const [p, m] = await Promise.all([listProjects(), listMessages()]);
        setProjects(Array.isArray(p) ? p : []);
        setMessages(Array.isArray(m) ? m : []);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------------- helpers ---------------- */

  function n(v) {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  }

  function money(v) {
    const x = n(v);
    return `$${Math.round(x).toLocaleString()}`;
  }

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function statusLabel(s) {
    const v = String(s || "").toLowerCase();
    if (!v) return "unknown";
    return v;
  }

  function stageFromStatus(status) {
    // Treat status as "pipeline stage" (no backend change).
    // If you later add real stages, just replace this mapping.
    const s = statusLabel(status);
    if (s === "completed" || s === "done") return "completed";
    if (s === "archived" || s === "canceled" || s === "cancelled") return "archived";
    if (s === "active" || s === "in_progress" || s === "in progress") return "active";
    return s;
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  }

  function downloadCSV(filename, rows) {
    const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  /* ---------------- derived ---------------- */

  const activeProjects = useMemo(
    () => projects.filter((p) => stageFromStatus(p.status) === "active"),
    [projects]
  );

  const completedProjects = useMemo(
    () => projects.filter((p) => stageFromStatus(p.status) === "completed"),
    [projects]
  );

  const archivedProjects = useMemo(
    () => projects.filter((p) => stageFromStatus(p.status) === "archived"),
    [projects]
  );

  const totalRevenue = useMemo(
    () => projects.reduce((sum, p) => sum + n(p.budget), 0),
    [projects]
  );

  const activeRevenue = useMemo(
    () => activeProjects.reduce((sum, p) => sum + n(p.budget), 0),
    [activeProjects]
  );

  const completedRevenue = useMemo(
    () => completedProjects.reduce((sum, p) => sum + n(p.budget), 0),
    [completedProjects]
  );

  const unreadLeads = useMemo(
    () => messages.filter((m) => String(m.status || "").toLowerCase() === "new"),
    [messages]
  );

  const convertedLeads = useMemo(
    () => messages.filter((m) => !!m.convertedToProject || String(m.status || "").toLowerCase() === "converted"),
    [messages]
  );

  // Charts (keep StatsChart usage minimal to avoid breaking existing props)
  const revenueSeries = useMemo(
    () => groupByDay(projects, (p) => n(p.budget)),
    [projects]
  );

  const leadSeries = useMemo(
    () => groupByDay(messages, () => 1),
    [messages]
  );

  /* ---------------- forecasting model ----------------
     We can’t assume perfect data exists, so we keep it resilient:
     - If budgets exist: use them.
     - If not: fallback to avg project value from whatever budgets exist.
     - Confidence bands use a simple variance heuristic:
       - If there’s enough budget history, use std deviation to set bands.
       - Otherwise use percent bands.
  ----------------------------------------------------- */

  const forecast = useMemo(() => {
    const budgets = projects.map((p) => n(p.budget)).filter((x) => x > 0);

    const avg = budgets.length ? budgets.reduce((a, b) => a + b, 0) / budgets.length : 0;

    // Std dev if we have enough samples; else fallback
    let std = 0;
    if (budgets.length >= 6) {
      const mean = avg;
      const variance = budgets.reduce((acc, x) => acc + (x - mean) ** 2, 0) / budgets.length;
      std = Math.sqrt(variance);
    }

    // Expected monthly = avg project value * active count (simple)
    const expectedMonthly = avg * Math.max(1, activeProjects.length);

    // Bands:
    // If std exists, scale with active count but dampen a bit (sqrt).
    // Else fallback to +/- 25% / 45%.
    const bandTight = std > 0 ? (std * Math.sqrt(Math.max(1, activeProjects.length)) * 0.6) : expectedMonthly * 0.25;
    const bandWide = std > 0 ? (std * Math.sqrt(Math.max(1, activeProjects.length)) * 1.0) : expectedMonthly * 0.45;

    const months = [
      { label: "30 days", mult: 1 },
      { label: "60 days", mult: 2 },
      { label: "90 days", mult: 3 },
    ];

    const series = months.map((m) => {
      const expected = expectedMonthly * m.mult;
      const low = Math.max(0, expected - bandWide * m.mult);
      const high = expected + bandWide * m.mult;
      const likelyLow = Math.max(0, expected - bandTight * m.mult);
      const likelyHigh = expected + bandTight * m.mult;

      return {
        label: m.label,
        low: Math.round(low),
        likelyLow: Math.round(likelyLow),
        expected: Math.round(expected),
        likelyHigh: Math.round(likelyHigh),
        high: Math.round(high),
      };
    });

    return {
      avgProjectValue: avg,
      expectedMonthly,
      series,
    };
  }, [projects, activeProjects]);

  /* ---------------- forecast by stage ---------------- */

  const stageForecast = useMemo(() => {
    // Use existing status as stage. Projected revenue is “what’s in the pipe”
    // We do: active = 80% weight, completed = 100%, archived = 0%.
    const weights = {
      active: 0.8,
      completed: 1.0,
      archived: 0.0,
    };

    const byStage = {};
    for (const p of projects) {
      const stage = stageFromStatus(p.status);
      const budget = n(p.budget);
      byStage[stage] = byStage[stage] || { stage, count: 0, revenue: 0, weighted: 0 };
      byStage[stage].count += 1;
      byStage[stage].revenue += budget;
      const w = weights[stage] ?? 0.5; // unknown stages = 50%
      byStage[stage].weighted += budget * w;
    }

    const rows = Object.values(byStage).sort((a, b) => (b.weighted || 0) - (a.weighted || 0));
    const totalWeighted = rows.reduce((s, r) => s + n(r.weighted), 0);

    return { rows, totalWeighted };
  }, [projects]);

  /* ---------------- per-client stats + forecast ---------------- */

  const clients = useMemo(() => {
    const map = new Map();

    for (const p of projects) {
      const email = (p.clientEmail || "").trim().toLowerCase() || "(no email)";
      const name = p.clientName || "Unknown";
      const budget = n(p.budget);
      const stage = stageFromStatus(p.status);

      if (!map.has(email)) {
        map.set(email, {
          email,
          name,
          total: 0,
          active: 0,
          completed: 0,
          archived: 0,
          projects: 0,
        });
      }

      const row = map.get(email);
      row.name = row.name || name;
      row.total += budget;
      row.projects += 1;
      if (stage === "active") row.active += budget;
      if (stage === "completed") row.completed += budget;
      if (stage === "archived") row.archived += budget;
    }

    // Simple “next 30 day” client projection = their active revenue * 0.8
    const out = Array.from(map.values())
      .map((r) => ({
        ...r,
        projected30: Math.round(r.active * 0.8),
      }))
      .sort((a, b) => (b.projected30 || 0) - (a.projected30 || 0));

    return out;
  }, [projects]);

  /* ---------------- conversion probability ---------------- */

  const leadConversion = useMemo(() => {
    const total = messages.length || 0;
    const converted = convertedLeads.length || 0;
    const overall = total ? converted / total : 0;

    // Status rates
    const byStatus = {};
    for (const m of messages) {
      const s = String(m.status || "unknown").toLowerCase();
      byStatus[s] = byStatus[s] || { status: s, count: 0, converted: 0 };
      byStatus[s].count += 1;
      if (m.convertedToProject || s === "converted") byStatus[s].converted += 1;
    }

    const byStatusRows = Object.values(byStatus)
      .map((r) => ({
        ...r,
        rate: r.count ? r.converted / r.count : 0,
      }))
      .sort((a, b) => (b.rate || 0) - (a.rate || 0));

    // Simple lead scoring (no ML, deterministic):
    // new=0.25, open=0.5, closed=0.1, converted=1.0, unknown=0.3
    const scoreMap = {
      new: 0.25,
      open: 0.5,
      closed: 0.1,
      converted: 1.0,
    };

    const scored = messages.map((m) => {
      const s = String(m.status || "unknown").toLowerCase();
      const base = scoreMap[s] ?? 0.3;

      // bonus if has name + longer message
      const nameBonus = m.name ? 0.05 : 0;
      const lengthBonus = m.message && String(m.message).length > 200 ? 0.05 : 0;

      return {
        id: m.id,
        name: m.name || "Anonymous",
        email: m.email || "",
        status: s,
        score: clamp01(base + nameBonus + lengthBonus),
        preview: (m.message || "").slice(0, 90),
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return { overall, byStatusRows, topLeads: scored.slice(0, 8) };
  }, [messages, convertedLeads]);

  if (loading) {
    return <div className="text-slate-400">Loading stats…</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl overflow-x-hidden">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Stats</h1>
        <p className="text-sm text-slate-400">
          Trends, pipeline, forecasting, and exports.
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 transition ${
              tab === t
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---------------- OVERVIEW ---------------- */}
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Projects" value={projects.length} />
            <StatCard label="Active Projects" value={activeProjects.length} />
            <StatCard label="Completed Projects" value={completedProjects.length} />
            <StatCard
              label="Unread Leads"
              value={unreadLeads.length}
              highlight={unreadLeads.length > 0}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Revenue Over Time">
              <StatsChart data={revenueSeries} />
            </Card>

            <Card title="Lead Volume Over Time">
              <StatsChart data={leadSeries} />
            </Card>
          </div>
        </>
      )}

      {/* ---------------- REVENUE ---------------- */}
      {tab === "revenue" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={money(totalRevenue)} highlight={totalRevenue > 0} />
            <StatCard label="Active Revenue" value={money(activeRevenue)} />
            <StatCard label="Completed Revenue" value={money(completedRevenue)} />
            <StatCard label="Avg Project Value" value={money(forecast.avgProjectValue)} />
          </div>

          <Card title="Pipeline by Stage (from project.status)">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-3">Stage</th>
                    <th className="text-right py-2 px-3">Projects</th>
                    <th className="text-right py-2 px-3">Raw Revenue</th>
                    <th className="text-right py-2 pl-3">Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {stageForecast.rows.map((r) => (
                    <tr key={r.stage} className="border-b border-white/5">
                      <td className="py-2 pr-3 text-slate-200">{r.stage}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{r.count}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{money(r.revenue)}</td>
                      <td className="py-2 pl-3 text-right text-emerald-300">{money(r.weighted)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-3 text-slate-400">Total Weighted</td>
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3" />
                    <td className="py-3 pl-3 text-right text-emerald-300 font-semibold">
                      {money(stageForecast.totalWeighted)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Top Clients (by projected 30 days)">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-3">Client</th>
                    <th className="text-left py-2 pr-3">Email</th>
                    <th className="text-right py-2 px-3">Projects</th>
                    <th className="text-right py-2 px-3">Total</th>
                    <th className="text-right py-2 pl-3">Projected 30d</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.slice(0, 10).map((c) => (
                    <tr key={c.email} className="border-b border-white/5">
                      <td className="py-2 pr-3 text-slate-200">{c.name}</td>
                      <td className="py-2 pr-3 text-slate-400">{c.email}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{c.projects}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{money(c.total)}</td>
                      <td className="py-2 pl-3 text-right text-emerald-300">{money(c.projected30)}</td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td className="py-4 text-slate-500" colSpan={5}>
                        No client data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ---------------- FORECAST ---------------- */}
      {tab === "forecast" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Projected 30 days" value={money(forecast.series[0]?.expected)} highlight />
            <StatCard label="Projected 60 days" value={money(forecast.series[1]?.expected)} />
            <StatCard label="Projected 90 days" value={money(forecast.series[2]?.expected)} />
          </div>

          <Card title="Forecast Bands (Low / Likely / High)">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-3">Window</th>
                    <th className="text-right py-2 px-3">Low</th>
                    <th className="text-right py-2 px-3">Likely Low</th>
                    <th className="text-right py-2 px-3">Expected</th>
                    <th className="text-right py-2 px-3">Likely High</th>
                    <th className="text-right py-2 pl-3">High</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.series.map((f) => (
                    <tr key={f.label} className="border-b border-white/5">
                      <td className="py-2 pr-3 text-slate-200">{f.label}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{money(f.low)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{money(f.likelyLow)}</td>
                      <td className="py-2 px-3 text-right text-emerald-300 font-semibold">{money(f.expected)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{money(f.likelyHigh)}</td>
                      <td className="py-2 pl-3 text-right text-slate-400">{money(f.high)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Bands are derived from your budget history (std dev if available) + active pipeline count.
            </div>
          </Card>
        </>
      )}

      {/* ---------------- LEADS ---------------- */}
      {tab === "leads" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Leads" value={messages.length} />
            <StatCard label="Unread Leads" value={unreadLeads.length} highlight={unreadLeads.length > 0} />
            <StatCard label="Converted Leads" value={convertedLeads.length} highlight={convertedLeads.length > 0} />
            <StatCard
              label="Overall Conversion"
              value={`${Math.round((leadConversion.overall || 0) * 100)}%`}
              highlight={leadConversion.overall > 0}
            />
          </div>

          <Card title="Conversion Rate by Message Status">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-right py-2 px-3">Count</th>
                    <th className="text-right py-2 px-3">Converted</th>
                    <th className="text-right py-2 pl-3">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {leadConversion.byStatusRows.map((r) => (
                    <tr key={r.status} className="border-b border-white/5">
                      <td className="py-2 pr-3 text-slate-200">{r.status}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{r.count}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{r.converted}</td>
                      <td className="py-2 pl-3 text-right text-emerald-300">
                        {Math.round((r.rate || 0) * 100)}%
                      </td>
                    </tr>
                  ))}
                  {leadConversion.byStatusRows.length === 0 && (
                    <tr>
                      <td className="py-4 text-slate-500" colSpan={4}>
                        No lead data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Top Leads (simple conversion probability score)">
            <div className="space-y-2">
              {leadConversion.topLeads.map((l) => (
                <div
                  key={l.id}
                  className="rounded border border-white/10 bg-black/30 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-slate-200 truncate">
                        {l.name} <span className="text-slate-500">•</span>{" "}
                        <span className="text-slate-400">{l.email}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {l.preview}{l.preview.length >= 90 ? "…" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">{l.status}</span>
                      <span className="text-xs font-semibold text-emerald-300">
                        {Math.round(l.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {leadConversion.topLeads.length === 0 && (
                <div className="text-slate-500 text-sm">No leads yet.</div>
              )}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Score is deterministic (status + a couple small bonuses). No ML yet.
            </div>
          </Card>
        </>
      )}

      {/* ---------------- EXPORT ---------------- */}
      {tab === "export" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="Export Projects CSV"
              desc="Projects list including budget, status, client, and timestamps."
              onClick={() => {
                const rows = [
                  ["id", "title", "clientName", "clientEmail", "status", "budget", "pages", "goal", "domain", "graphics", "createdAt", "updatedAt", "source", "sourceMessageId"],
                  ...projects.map((p) => [
                    p.id,
                    p.title || "",
                    p.clientName || "",
                    p.clientEmail || "",
                    p.status || "",
                    p.budget ?? "",
                    p.pages ?? "",
                    p.goal || "",
                    p.domain || "",
                    p.graphics ? "true" : "false",
                    p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toISOString() : "",
                    p.updatedAt?.seconds ? new Date(p.updatedAt.seconds * 1000).toISOString() : "",
                    p.source || "",
                    p.sourceMessageId || "",
                  ]),
                ];
                downloadCSV("projects.csv", rows);
              }}
            />

            <ActionCard
              title="Export Messages CSV"
              desc="Messages including status, read flag, and conversion flags."
              onClick={() => {
                const rows = [
                  ["id", "name", "email", "status", "read", "convertedToProject", "projectId", "source", "page", "createdAt", "message"],
                  ...messages.map((m) => [
                    m.id,
                    m.name || "",
                    m.email || "",
                    m.status || "",
                    m.read ? "true" : "false",
                    m.convertedToProject ? "true" : "false",
                    m.projectId || "",
                    m.source || "",
                    m.page || "",
                    m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toISOString() : "",
                    m.message || "",
                  ]),
                ];
                downloadCSV("messages.csv", rows);
              }}
            />

            <ActionCard
              title="Export Forecast CSV"
              desc="Expected forecast + confidence bands."
              onClick={() => {
                const rows = [
                  ["window", "low", "likelyLow", "expected", "likelyHigh", "high"],
                  ...forecast.series.map((f) => [
                    f.label,
                    f.low,
                    f.likelyLow,
                    f.expected,
                    f.likelyHigh,
                    f.high,
                  ]),
                ];
                downloadCSV("forecast.csv", rows);
              }}
            />
          </div>

          <Card title="Quick Summary">
            <div className="text-sm text-slate-300 space-y-2">
              <div>
                <span className="text-slate-500">Total Revenue:</span>{" "}
                <span className="text-emerald-300 font-semibold">{money(totalRevenue)}</span>
              </div>
              <div>
                <span className="text-slate-500">Weighted Pipeline:</span>{" "}
                <span className="text-emerald-300 font-semibold">{money(stageForecast.totalWeighted)}</span>
              </div>
              <div>
                <span className="text-slate-500">Projected 30 days:</span>{" "}
                <span className="text-emerald-300 font-semibold">{money(forecast.series[0]?.expected)}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ---------------- UI components ---------------- */

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`bg-black/40 border rounded-lg p-4 ${
        highlight ? "border-emerald-500/40" : "border-white/10"
      }`}
    >
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ActionCard({ title, desc, onClick }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col gap-3">
      <div>
        <div className="text-sm font-medium text-slate-200">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{desc}</div>
      </div>

      <button
        onClick={onClick}
        className="mt-auto px-4 py-2 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
      >
        Download CSV
      </button>
    </div>
  );
}