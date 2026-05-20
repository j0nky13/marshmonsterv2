import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    businessName: String,
    website: String,
    message: String,
    source: {
      type: String,
      default: "contact_form"
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "converted", "archived"],
      default: "new"
    },
    convertedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("ContactRequest", contactRequestSchema);