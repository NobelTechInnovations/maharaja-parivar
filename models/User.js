import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    photoUrl: { type: String, default: "" },

    role: { type: String, enum: ["member", "admin"], default: "member" },

    // Pending until an admin reviews the registration; nothing pending is
    // searchable or visible in the directory.
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationRemarks: { type: String, default: "" },
    verifiedAt: { type: Date },

    // Set once the (future) OTP flow actually runs. Left false for every
    // account created through the current email+password flow.
    emailOtpVerified: { type: Boolean, default: false },

    // Forgot-password flow. Only the SHA-256 hash of the token is ever
    // stored — the raw token exists only in the emailed link, same
    // pattern as a password itself.
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
