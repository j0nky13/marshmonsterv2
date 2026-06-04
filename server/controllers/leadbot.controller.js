// import crypto from "crypto";
// import OpenAI from "openai";

// import Lead from "../models/Lead.js";
// import LeadSearch from "../models/LeadSearch.js";
// import WebsiteReport from "../models/WebsiteReport.js";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// function mockScore() {
//   return Math.floor(Math.random() * 36) + 55;
// }

// function normalizeWebsite(value = "") {
//   return value.replace(/^https?:\/\//, "").replace(/\/$/, "").trim();
// }

// function safeJsonParse(text) {
//   try {
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// }

// export async function searchLeads(req, res) {
//   try {
//     const { businessType, location, ratingThreshold = 80 } = req.body;

//     if (!businessType || !location) {
//       return res.status(400).json({
//         message: "Business type and location are required."
//       });
//     }

//     const city = location.split(",")[0]?.trim() || location;
//     const state = location.split(",")[1]?.trim() || "";

//     const results = Array.from({ length: 8 }).map((_, index) => {
//       const score = mockScore();

//       return {
//         tempId: crypto.randomUUID(),
//         businessName: `${city} ${businessType} Pros ${index + 1}`,
//         website: `${businessType.toLowerCase().replace(/\s+/g, "")}${index + 1}.com`,
//         email: `owner${index + 1}@example.com`,
//         phone: `(843) 555-${String(1000 + index).slice(0, 4)}`,
//         category: businessType,
//         city,
//         state,
//         ratingScore: score,
//         reason:
//           score < ratingThreshold
//             ? "Website appears below the selected quality threshold."
//             : "Website appears decent but may still be worth reviewing."
//       };
//     });

//     const search = await LeadSearch.create({
//       searchedBy: req.user._id,
//       businessType,
//       location,
//       ratingThreshold,
//       results
//     });

//     res.json({
//       searchId: search._id,
//       results
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lead Bot search failed",
//       error: error.message
//     });
//   }
// }

// export async function saveLeadBotResults(req, res) {
//   try {
//     const { searchId, selectedResults = [] } = req.body;

//     if (!selectedResults.length) {
//       return res.status(400).json({
//         message: "No leads selected."
//       });
//     }

//     const createdLeads = await Lead.insertMany(
//       selectedResults.map((lead) => ({
//         businessName: lead.businessName,
//         website: lead.website,
//         email: lead.email,
//         phone: lead.phone,
//         category: lead.category,
//         city: lead.city,
//         state: lead.state,
//         ratingScore: lead.ratingScore,
//         source: "leadbot",
//         status: "new",
//         assignedTo: req.user._id,
//         createdBy: req.user._id,
//         notes: lead.reason || ""
//       }))
//     );

//     if (searchId) {
//       await LeadSearch.findByIdAndUpdate(searchId, {
//         $push: {
//           savedLeadIds: {
//             $each: createdLeads.map((lead) => lead._id)
//           }
//         }
//       });
//     }

//     res.status(201).json({
//       leads: createdLeads
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to save Lead Bot results",
//       error: error.message
//     });
//   }
// }

// export async function rateWebsite(req, res) {
//   try {
//     const { website } = req.body;

//     if (!website) {
//       return res.status(400).json({
//         message: "Website is required."
//       });
//     }

//     if (!process.env.OPENAI_API_KEY) {
//       return res.status(500).json({
//         message: "OPENAI_API_KEY is missing from server .env"
//       });
//     }

//     const cleanWebsite = normalizeWebsite(website);

//     const response = await openai.responses.create({
//       model: process.env.OPENAI_MODEL || "gpt-5.5",
//       input: [
//         {
//           role: "system",
//           content:
//             "You are a senior web design, SEO, conversion-rate, and local business marketing auditor for a web agency CRM. Return only valid JSON."
//         },
//         {
//           role: "user",
//           content: `
// Analyze this business website from the perspective of whether Marsh Monster should pitch them web/design/SEO/marketing work.

// Website: ${cleanWebsite}

// Return valid JSON only with this exact structure:
// {
//   "score": number,
//   "performanceScore": number,
//   "seoScore": number,
//   "mobileScore": number,
//   "designScore": number,
//   "summary": "short client-ready summary",
//   "opportunities": ["specific pitch opportunity"],
//   "recommendations": ["specific recommendation"],
//   "outreachAngle": "short outreach angle",
//   "emailDraft": "short personalized email draft"
// }

// Scoring rules:
// - 0-100 scale
// - lower score means better sales opportunity
// - be realistic
// - do not claim you actually browsed the website unless browser data was provided
// - if you cannot inspect the site live, base the response on likely audit categories and clearly phrase it as a preliminary audit
//           `
//         }
//       ]
//     });

//     const parsed = safeJsonParse(response.output_text);

//     if (!parsed) {
//       return res.status(500).json({
//         message: "AI returned invalid JSON.",
//         raw: response.output_text
//       });
//     }

//     const report = await WebsiteReport.create({
//       createdBy: req.user._id,
//       website: cleanWebsite,
//       score: Number(parsed.score || 0),
//       performanceScore: Number(parsed.performanceScore || 0),
//       seoScore: Number(parsed.seoScore || 0),
//       mobileScore: Number(parsed.mobileScore || 0),
//       designScore: Number(parsed.designScore || 0),
//       summary: parsed.summary || "",
//       recommendations: parsed.recommendations || [],
//       publicSlug: crypto.randomBytes(8).toString("hex"),
//       opportunities: parsed.opportunities || [],
//       outreachAngle: parsed.outreachAngle || "",
//       emailDraft: parsed.emailDraft || ""
//     });

//     res.status(201).json({
//       report
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Website rating failed",
//       error: error.message
//     });
//   }
// }


import { useMemo, useState } from "react";
import { Bot, Check, FileText, Search } from "lucide-react";
import { apiFetch } from "../api/api";

const GREEN = "#B6F24A";

export default function LeadBotTab() {
  const [activeMode, setActiveMode] = useState("search");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-[#B6F24A] text-sm font-semibold uppercase tracking-widest">
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
              ? "text-black"
              : "text-zinc-300 hover:bg-zinc-900"
          }`}
          style={{
            backgroundColor: activeMode === "search" ? GREEN : "transparent",
          }}
        >
          <Search size={18} />
          Search Leads
        </button>

        <button
          onClick={() => setActiveMode("rating")}
          className={`flex-1 rounded-2xl px-4 py-3 font-bold flex items-center justify-center gap-2 ${
            activeMode === "rating"
              ? "text-black"
              : "text-zinc-300 hover:bg-zinc-900"
          }`}
          style={{
            backgroundColor: activeMode === "rating" ? GREEN : "transparent",
          }}
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
    ratingThreshold: 80,
  });

  const [searchId, setSearchId] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState({});
  const [activeLead, setActiveLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedResults = useMemo(
    () => results.filter((item) => selected[item.tempId]),
    [results, selected]
  );

  const selectedCount = selectedResults.length;

  async function handleSearch(e) {
    e.preventDefault();

    setLoading(true);
    setResults([]);
    setSelected({});
    setActiveLead(null);

    try {
      const data = await apiFetch("/leadbot/search", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const nextResults = Array.isArray(data.results) ? data.results : [];

      setSearchId(data.searchId || null);
      setResults(nextResults);
      setActiveLead(nextResults[0] || null);
    } catch (error) {
      alert(error.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSelected() {
    if (!selectedCount) return;

    setSaving(true);

    try {
      const data = await apiFetch("/leadbot/save", {
        method: "POST",
        body: JSON.stringify({
          searchId,
          selectedResults,
        }),
      });

      alert(`${data.leads?.length || 0} leads saved to CRM.`);
      setSelected({});
    } catch (error) {
      alert(error.message || "Failed to save leads.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr_420px] gap-6">
      <form
        onSubmit={handleSearch}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 h-fit"
      >
        <div>
          <p className="text-[#B6F24A] text-sm font-semibold uppercase tracking-widest">
            Search
          </p>

          <h2 className="text-2xl font-black mt-2">Find businesses</h2>

          <p className="text-zinc-400 text-sm mt-2">
            Search businesses below your selected website score threshold.
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
            setForm((prev) => ({
              ...prev,
              ratingThreshold: Number(value),
            }))
          }
          placeholder="80"
        />

        <button
          disabled={loading}
          className="w-full text-black font-bold rounded-2xl py-3 disabled:opacity-50"
          style={{ backgroundColor: GREEN }}
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
            className="text-black font-bold rounded-2xl px-5 py-3 disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
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
              <div
                key={item.tempId}
                onClick={() => setActiveLead(item)}
                className={`p-5 flex gap-4 hover:bg-zinc-900/50 cursor-pointer ${
                  activeLead?.tempId === item.tempId ? "bg-zinc-900/70" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(selected[item.tempId])}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [item.tempId]: e.target.checked,
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

                      <p className="text-[#B6F24A] text-sm">
                        {item.website}
                      </p>
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
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 h-fit">
        {!activeLead ? (
          <div className="text-zinc-500">
            Select a lead to view outreach details.
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-[#B6F24A] text-sm">{activeLead.website}</p>
              <h2 className="text-2xl font-black mt-1">
                {activeLead.businessName}
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                {activeLead.city}, {activeLead.state}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-zinc-500 text-sm mb-2">Why this is a lead</p>
              <p className="text-zinc-300">{activeLead.reason}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-zinc-500 text-sm mb-2">AI Outreach Draft</p>
              <p className="text-zinc-300 whitespace-pre-wrap">
                {activeLead.emailDraft ||
                  `Hey ${activeLead.businessName},\n\nI was reviewing your website and noticed a few things that may be hurting conversions and local search visibility.\n\nThe main issue I noticed was: ${activeLead.reason}\n\nWe help businesses improve their website performance, SEO, and lead conversion. Would you be open to a quick conversation this week?\n\n- Marsh Monster`}
              </p>
            </div>
          </div>
        )}
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
        body: JSON.stringify({ website }),
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
          <p className="text-[#B6F24A] text-sm font-semibold uppercase tracking-widest">
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
          className="w-full text-black font-bold rounded-2xl py-3 disabled:opacity-50"
          style={{ backgroundColor: GREEN }}
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
                <p className="text-[#B6F24A] text-sm">{report.website}</p>
                <h2 className="text-3xl font-black mt-1">
                  Website Score Report
                </h2>
              </div>

              <div
                className="rounded-3xl text-black p-5 text-center min-w-28"
                style={{ backgroundColor: GREEN }}
              >
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
                    <Check size={18} className="text-[#B6F24A] mt-0.5" />
                    <p className="text-zinc-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {report.opportunities?.length > 0 && (
              <div>
                <h3 className="font-black text-xl mb-3">
                  Sales Opportunities
                </h3>

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
                <p className="text-zinc-500 text-sm mb-2">
                  AI Outreach Draft
                </p>
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {report.emailDraft}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-zinc-500 text-sm">Public report slug</p>
              <p className="text-[#B6F24A] font-mono mt-1">
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
        className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#B6F24A]"
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