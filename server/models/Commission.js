import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null
    },

    clientName: {
      type: String,
      required: true,
      trim: true
    },

    projectName: {
      type: String,
      trim: true,
      default: ""
    },

    dealAmount: {
      type: Number,
      required: true,
      default: 0
    },

    commissionRate: {
      type: Number,
      default: 0.5
    },

    totalCommission: {
      type: Number,
      default: 0
    },

    paidCommission: {
      type: Number,
      default: 0
    },

    outstandingCommission: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "partially_paid", "paid"],
      default: "pending"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

commissionSchema.pre("save", function (next) {
  this.totalCommission = this.dealAmount * this.commissionRate;
  this.outstandingCommission = Math.max(
    this.totalCommission - this.paidCommission,
    0
  );

  if (this.paidCommission <= 0) {
    this.status = "pending";
  } else if (this.outstandingCommission <= 0) {
    this.status = "paid";
  } else {
    this.status = "partially_paid";
  }

  next();
});

export default mongoose.model("Commission", commissionSchema);