import { useState } from "react";
import { Bot, Check, FileText, Search } from "lucide-react";
import { apiFetch } from "../api/api";

export default function LeadBotTab() {
  const [activeMode, setActiveMode] = useState("search");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Lead Bot
        </p>

        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          AI-powered prospecting
        </h1>

        <p className="text-zinc-400 mt-4 max-w-3xl">
          Search for businesses, save selected prospects into the CRM, and
          generate website rating reports for outreach.
        </p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-2 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => setActiveMode("search")}
          className={`flex-1 rounded-2xl px-4 py-3 font-bold flex items-center justify-center gap-2 ${
            activeMode === "search"
              ? "bg-lime-400 text-black"
              : "text-zinc-300 hover:bg-zinc-900"
          }`}
        >
          <Search size={18} />
          Search Leads
        </button>

        <button
          onClick={() => setActiveMode("rating")}
          className={`flex-1 rounded-2xl px-4 py-3 font-bold flex items-center justify-center gap-2 ${
            activeMode === "rating"
              ? "bg-lime-400 text-black"
              : "text-zinc-300 hover:bg-zinc-900"
          }`}
        >
          <FileText size={18} />
          Website Rating
        </button>
      </div>

      {activeMode === "search" ? <LeadSearchPanel /> : <WebsiteRatingPanel />}
    </div>
  );
}

function LeadSearchPanel() {
  const [form, setForm] = useState({
    businessType: "",
    location: "",
    ratingThreshold: 80
  });

  const [searchId, setSearchId] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setSelected({});

    try {
      const data = await apiFetch("/leadbot/search", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setSearchId(data.searchId);
      setResults(data.results || []);
    } catch (error) {
      alert(error.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSelected() {
    const selectedResults = results.filter((item) => selected[item.tempId]);

    setSaving(true);

    try {
      const data = await apiFetch("/leadbot/save", {
        method: "POST",
        body: JSON.stringify({
          searchId,
          selectedResults
        })
      });

      alert(`${data.leads.length} leads saved to CRM.`);
      setSelected({});
    } catch (error) {
      alert(error.message || "Failed to save leads.");
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = results.filter((item) => selected[item.tempId]).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      <form
        onSubmit={handleSearch}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 h-fit"
      >
        <div>
          <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
            Search
          </p>

          <h2 className="text-2xl font-black mt-2">Find businesses</h2>

          <p className="text-zinc-400 text-sm mt-2">
            Mock data.
          </p>
        </div>

        <Input
          label="Business Type"
          value={form.businessType}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, businessType: value }))
          }
          placeholder="Roofing, HVAC, Dentist..."
        />

        <Input
          label="Location"
          value={form.location}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, location: value }))
          }
          placeholder="Charleston, SC"
        />

        <Input
          label="Rating Threshold"
          type="number"
          value={form.ratingThreshold}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, ratingThreshold: Number(value) }))
          }
          placeholder="80"
        />

        <button
          disabled={loading}
          className="w-full bg-lime-400 text-black font-bold rounded-2xl py-3 hover:bg-lime-300 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Run Search"}
        </button>
      </form>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-bold">Search Results</p>
            <p className="text-sm text-zinc-500">
              {results.length} results · {selectedCount} selected
            </p>
          </div>

          <button
            onClick={saveSelected}
            disabled={!selectedCount || saving}
            className="bg-lime-400 text-black font-bold rounded-2xl px-5 py-3 hover:bg-lime-300 disabled:opacity-50"
          >
            {saving ? "Saving..." : `Save Selected (${selectedCount})`}
          </button>
        </div>

        <div className="divide-y divide-zinc-800">
          {results.length === 0 ? (
            <div className="p-8 text-zinc-500">
              No search results yet. Run a search to generate leads.
            </div>
          ) : (
            results.map((item) => (
              <label
                key={item.tempId}
                className="p-5 flex gap-4 hover:bg-zinc-900/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Boolean(selected[item.tempId])}
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [item.tempId]: e.target.checked
                    }))
                  }
                  className="mt-1"
                />

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="font-black text-white">
                        {item.businessName}
                      </p>

                      <p className="text-lime-400 text-sm">{item.website}</p>
                    </div>

                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm font-bold">
                      {item.ratingScore}/100
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm mt-2">{item.reason}</p>

                  <p className="text-zinc-500 text-xs mt-2">
                    {item.email} · {item.phone} · {item.city}, {item.state}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function WebsiteRatingPanel() {
  const [website, setWebsite] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRate(e) {
    e.preventDefault();
    setLoading(true);
    setReport(null);

    try {
      const data = await apiFetch("/leadbot/rate", {
        method: "POST",
        body: JSON.stringify({ website })
      });

      setReport(data.report);
    } catch (error) {
      alert(error.message || "Rating failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      <form
        onSubmit={handleRate}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 h-fit"
      >
        <div>
          <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
            Rating
          </p>

          <h2 className="text-2xl font-black mt-2">Website report</h2>

          <p className="text-zinc-400 text-sm mt-2">
            Generate a client-ready diagnostic report.
          </p>
        </div>

        <Input
          label="Website"
          value={website}
          onChange={setWebsite}
          placeholder="https://example.com"
        />

        <button
          disabled={loading}
          className="w-full bg-lime-400 text-black font-bold rounded-2xl py-3 hover:bg-lime-300 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Rating"}
        </button>
      </form>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
        {!report ? (
          <div className="text-zinc-500">
            No report yet. Enter a website to generate one.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-lime-400 text-sm">{report.website}</p>
                <h2 className="text-3xl font-black mt-1">
                  Website Score Report
                </h2>
              </div>

              <div className="rounded-3xl bg-lime-400 text-black p-5 text-center min-w-28">
                <p className="text-4xl font-black">{report.score}</p>
                <p className="text-xs font-bold">/100</p>
              </div>
            </div>

            <p className="text-zinc-300">{report.summary}</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Score label="Performance" value={report.performanceScore} />
              <Score label="SEO" value={report.seoScore} />
              <Score label="Mobile" value={report.mobileScore} />
              <Score label="Design" value={report.designScore} />
            </div>

            <div>
              <h3 className="font-black text-xl mb-3">Recommendations</h3>

              <div className="space-y-2">
                {report.recommendations?.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 bg-black border border-zinc-800 rounded-2xl p-4"
                  >
                    <Check size={18} className="text-lime-400 mt-0.5" />
                    <p className="text-zinc-300">{item}</p>
                  </div>
                ))}
              </div>
              </div>
              
              {report.opportunities?.length > 0 && (
  <div>
    <h3 className="font-black text-xl mb-3">Sales Opportunities</h3>

    <div className="space-y-2">
      {report.opportunities.map((item) => (
        <div
          key={item}
          className="bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-300"
        >
          {item}
        </div>
      ))}
    </div>
  </div>
)}

{report.emailDraft && (
  <div className="rounded-2xl border border-zinc-800 bg-black p-4">
    <p className="text-zinc-500 text-sm mb-2">AI Outreach Draft</p>
    <p className="text-zinc-300 whitespace-pre-wrap">{report.emailDraft}</p>
  </div>
)}

            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-zinc-500 text-sm">Public report slug</p>
              <p className="text-lime-400 font-mono mt-1">
                /reports/{report.publicSlug}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-400 mb-2">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
      />
    </label>
  );
}

function Score({ label, value }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
}