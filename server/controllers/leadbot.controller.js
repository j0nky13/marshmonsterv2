import crypto from "crypto";
import OpenAI from "openai";

import Lead from "../models/Lead.js";
import LeadSearch from "../models/LeadSearch.js";
import WebsiteReport from "../models/WebsiteReport.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalizeWebsite(value = "") {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "").trim();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function estimateLeadScore(item) {
  let score = 80;

  if (!item.website) score -= 25;
  if (!item.rating) score -= 10;
  if (item.rating && item.rating < 4.2) score -= 10;
  if (item.reviews && item.reviews < 25) score -= 8;
  if (!item.phone) score -= 5;

  return Math.max(35, Math.min(95, score));
}

function buildLeadReason(item, score) {
  const issues = [];

  if (!item.website) issues.push("No website found");
  if (!item.rating) issues.push("No Google rating found");

  if (item.rating && item.rating < 4.2) {
    issues.push(`Lower Google rating (${item.rating})`);
  }

  if (item.reviews && item.reviews < 25) {
    issues.push(`Low review count (${item.reviews})`);
  }

  if (!item.phone) issues.push("No phone number found");

  if (issues.length === 0) {
    issues.push("Potential website, SEO, or conversion opportunity");
  }

  return issues.join(", ");
}

export async function searchLeads(req, res) {
  try {
    const { businessType, location, ratingThreshold = 80 } = req.body;

    if (!businessType || !location) {
      return res.status(400).json({
        message: "Business type and location are required.",
      });
    }

    if (!process.env.SERPAPI_API_KEY) {
      return res.status(500).json({
        message: "SERPAPI_API_KEY is missing from server .env",
      });
    }

    const city = location.split(",")[0]?.trim() || location;
    const state = location.split(",")[1]?.trim() || "";

    const params = new URLSearchParams({
      engine: "google_maps",
      q: `${businessType} in ${location}`,
      type: "search",
      api_key: process.env.SERPAPI_API_KEY,
    });

    const serpRes = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    if (!serpRes.ok) {
      const rawError = await serpRes.text();

      return res.status(500).json({
        message: "SerpAPI search failed.",
        error: rawError,
      });
    }

    const serpData = await serpRes.json();

    const localResults = Array.isArray(serpData.local_results)
      ? serpData.local_results
      : [];

    const results = localResults
      .slice(0, 20)
      .map((item) => {
        const score = estimateLeadScore(item);

        return {
          tempId: crypto.randomUUID(),
          businessName: item.title || "Unnamed Business",
          website: item.website || "",
          email: "",
          phone: item.phone || "",
          category: businessType,
          city,
          state,
          address: item.address || "",
          googleRating: item.rating || null,
          reviewCount: item.reviews || null,
          ratingScore: score,
          reason: buildLeadReason(item, score),
        };
      })
      .filter((item) => {
        return Number(item.ratingScore || 0) <= Number(ratingThreshold || 80);
      });

    const search = await LeadSearch.create({
      searchedBy: req.user._id,
      businessType,
      location,
      ratingThreshold,
      results,
    });

    return res.json({
      searchId: search._id,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lead Bot search failed",
      error: error.message,
    });
  }
}

export async function saveLeadBotResults(req, res) {
  try {
    const { searchId, selectedResults = [] } = req.body;

    if (!selectedResults.length) {
      return res.status(400).json({
        message: "No leads selected.",
      });
    }

    const createdLeads = await Lead.insertMany(
      selectedResults.map((lead) => ({
        businessName: lead.businessName || "",
        website: lead.website || "",
        email: lead.email || "",
        phone: lead.phone || "",
        category: lead.category || "",
        city: lead.city || "",
        state: lead.state || "",
        address: lead.address || "",
        googleRating: lead.googleRating || null,
        reviewCount: lead.reviewCount || null,
        ratingScore: Number(lead.ratingScore || 0),
        source: "leadbot",
        status: "new",
        assignedTo: req.user._id,
        createdBy: req.user._id,
        notes: lead.reason || "",
      }))
    );

    if (searchId) {
      await LeadSearch.findByIdAndUpdate(searchId, {
        $push: {
          savedLeadIds: {
            $each: createdLeads.map((lead) => lead._id),
          },
        },
      });
    }

    return res.status(201).json({
      leads: createdLeads,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save Lead Bot results",
      error: error.message,
    });
  }
}

export async function rateWebsite(req, res) {
  try {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({
        message: "Website is required.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: "OPENAI_API_KEY is missing from server .env",
      });
    }

    const cleanWebsite = normalizeWebsite(website);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are a senior web design, SEO, conversion-rate, and local business marketing auditor for a web agency CRM. Return only valid JSON.",
        },
        {
          role: "user",
          content: `
Analyze this business website from the perspective of whether Marsh Monster should pitch them web/design/SEO/marketing work.

Website: ${cleanWebsite}

Return valid JSON only with this exact structure:
{
  "score": number,
  "performanceScore": number,
  "seoScore": number,
  "mobileScore": number,
  "designScore": number,
  "summary": "short client-ready summary",
  "opportunities": ["specific pitch opportunity"],
  "recommendations": ["specific recommendation"],
  "outreachAngle": "short outreach angle",
  "emailDraft": "short personalized email draft"
}

Scoring rules:
- 0-100 scale
- lower score means better sales opportunity
- be realistic
- do not claim you actually browsed the website unless browser data was provided
- if you cannot inspect the site live, base the response on likely audit categories and clearly phrase it as a preliminary audit
          `,
        },
      ],
    });

    const parsed = safeJsonParse(response.output_text);

    if (!parsed) {
      return res.status(500).json({
        message: "AI returned invalid JSON.",
        raw: response.output_text,
      });
    }

    const report = await WebsiteReport.create({
      createdBy: req.user._id,
      website: cleanWebsite,
      score: Number(parsed.score || 0),
      performanceScore: Number(parsed.performanceScore || 0),
      seoScore: Number(parsed.seoScore || 0),
      mobileScore: Number(parsed.mobileScore || 0),
      designScore: Number(parsed.designScore || 0),
      summary: parsed.summary || "",
      recommendations: parsed.recommendations || [],
      publicSlug: crypto.randomBytes(8).toString("hex"),
      opportunities: parsed.opportunities || [],
      outreachAngle: parsed.outreachAngle || "",
      emailDraft: parsed.emailDraft || "",
    });

    return res.status(201).json({
      report,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Website rating failed",
      error: error.message,
    });
  }
}