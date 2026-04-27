import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
        },
    
    customerId: {

  type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null

},

    status: {
      type: String,
      enum: [
        "planning",
        "in_progress",
        "waiting_client",
        "completed",
        "on_hold"
      ],
      default: "planning"
    },

    projectType: {
      type: String,
      default: ""
    },

    budget: {
      type: Number,
      default: 0
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    dueDate: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ""
    },
    
  },
  { timestamps: true }
);


export default mongoose.model("Project", projectSchema);