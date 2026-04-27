import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    name: {
      type: String,
      trim: true,
      default: ""
    },

    role: {
      type: String,
      enum: ["admin", "staff", "customer", "blocked"],
      default: "blocked"
    },

    status: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "pending"
    },

    avatarUrl: {
      type: String,
      default: ""
    },

    lastLoginAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);