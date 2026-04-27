import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true
    },

    website: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    address: {
      type: String,
      trim: true,
      default: ""
    },

    city: String,
    state: String,
    category: String,

    source: {
      type: String,
      default: "manual"
    },

    status: {
      type: String,
      enum: ["new", "contacted", "follow_up", "won", "lost", "archived"],
      default: "new"
    },

    ratingScore: {
      type: Number,
      default: null
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    notes: {
      type: String,
      default: ""
    },

    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },

    lastContactedAt: Date,
    nextFollowUpAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);