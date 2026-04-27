import crypto from "crypto";
import OpenAI from "openai";

import Lead from "../models/Lead.js";
import LeadSearch from "../models/LeadSearch.js";
import WebsiteReport from "../models/WebsiteReport.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function mockScore() {
  return Math.floor(Math.random() * 36) + 55;
}

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

export async function searchLeads(req, res) {
  try {
    const { businessType, location, ratingThreshold = 80 } = req.body;

    if (!businessType || !location) {
      return res.status(400).json({
        message: "Business type and location are required."
      });
    }

    const city = location.split(",")[0]?.trim() || location;
    const state = location.split(",")[1]?.trim() || "";

    const results = Array.from({ length: 8 }).map((_, index) => {
      const score = mockScore();

      return {
        tempId: crypto.randomUUID(),
        businessName: `${city} ${businessType} Pros ${index + 1}`,
        website: `${businessType.toLowerCase().replace(/\s+/g, "")}${index + 1}.com`,
        email: `owner${index + 1}@example.com`,
        phone: `(843) 555-${String(1000 + index).slice(0, 4)}`,
        category: businessType,
        city,
        state,
        ratingScore: score,
        reason:
          score < ratingThreshold
            ? "Website appears below the selected quality threshold."
            : "Website appears decent but may still be worth reviewing."
      };
    });

    const search = await LeadSearch.create({
      searchedBy: req.user._id,
      businessType,
      location,
      ratingThreshold,
      results
    });

    res.json({
      searchId: search._id,
      results
    });
  } catch (error) {
    res.status(500).json({
      message: "Lead Bot search failed",
      error: error.message
    });
  }
}

export async function saveLeadBotResults(req, res) {
  try {
    const { searchId, selectedResults = [] } = req.body;

    if (!selectedResults.length) {
      return res.status(400).json({
        message: "No leads selected."
      });
    }

    const createdLeads = await Lead.insertMany(
      selectedResults.map((lead) => ({
        businessName: lead.businessName,
        website: lead.website,
        email: lead.email,
        phone: lead.phone,
        category: lead.category,
        city: lead.city,
        state: lead.state,
        ratingScore: lead.ratingScore,
        source: "leadbot",
        status: "new",
        assignedTo: req.user._id,
        createdBy: req.user._id,
        notes: lead.reason || ""
      }))
    );

    if (searchId) {
      await LeadSearch.findByIdAndUpdate(searchId, {
        $push: {
          savedLeadIds: {
            $each: createdLeads.map((lead) => lead._id)
          }
        }
      });
    }

    res.status(201).json({
      leads: createdLeads
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save Lead Bot results",
      error: error.message
    });
  }
}

export async function rateWebsite(req, res) {
  try {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({
        message: "Website is required."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: "OPENAI_API_KEY is missing from server .env"
      });
    }

    const cleanWebsite = normalizeWebsite(website);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are a senior web design, SEO, conversion-rate, and local business marketing auditor for a web agency CRM. Return only valid JSON."
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
          `
        }
      ]
    });

    const parsed = safeJsonParse(response.output_text);

    if (!parsed) {
      return res.status(500).json({
        message: "AI returned invalid JSON.",
        raw: response.output_text
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
      emailDraft: parsed.emailDraft || ""
    });

    res.status(201).json({
      report
    });
  } catch (error) {
    res.status(500).json({
      message: "Website rating failed",
      error: error.message
    });
  }
}