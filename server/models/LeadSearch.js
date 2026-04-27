import mongoose from "mongoose";

const leadSearchSchema = new mongoose.Schema(
  {
    searchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    businessType: String,
    location: String,
    ratingThreshold: {
      type: Number,
      default: 80
    },

    results: {
      type: Array,
      default: []
    },

    savedLeadIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("LeadSearch", leadSearchSchema);