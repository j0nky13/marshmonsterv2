import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    invoiceNumber: {
      type: String,
      unique: true,
      required: true
    },

    clientName: {
      type: String,
      required: true
    },

    title: {
      type: String,
      default: "Project Invoice"
    },

    description: {
      type: String,
      default: ""
    },

    amount: {
      type: Number,
      required: true,
      default: 0
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["draft", "sent", "partially_paid", "paid", "void"],
      default: "draft"
    },

    dueDate: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

invoiceSchema.virtual("balanceDue").get(function () {
  return Math.max((this.amount || 0) - (this.paidAmount || 0), 0);
});

invoiceSchema.pre("save", function (next) {
  if (this.status === "void") return next();

  if ((this.paidAmount || 0) <= 0) {
    this.status = this.status === "sent" ? "sent" : "draft";
  } else if (this.paidAmount >= this.amount) {
    this.status = "paid";
  } else {
    this.status = "partially_paid";
  }

  next();
});

invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Invoice", invoiceSchema);