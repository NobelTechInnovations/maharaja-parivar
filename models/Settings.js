import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

// Singleton document (key: "global") for admin-toggleable app behavior —
// currently just whether new registrations skip manual review.
const SettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true },
    autoApproveEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Settings || model("Settings", SettingsSchema);
