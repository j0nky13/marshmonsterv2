import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    originalName: {
      type: String,
      required: true
    },

    storedName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    mimeType: {
      type: String,
      default: ""
    },

    size: {
      type: Number,
      default: 0
    },

    visibility: {
      type: String,
      enum: ["internal", "customer"],
      default: "customer"
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProjectFile", projectFileSchema);