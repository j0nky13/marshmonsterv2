import mongoose from "mongoose";

const websiteReportSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    website: {
      type: String,
      required: true
    },

    score: Number,
    performanceScore: Number,
    seoScore: Number,
    mobileScore: Number,
    designScore: Number,

    summary: String,
    opportunities: [String],
    recommendations: [String],
    outreachAngle: String,
    emailDraft: String,

    publicSlug: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("WebsiteReport", websiteReportSchema);