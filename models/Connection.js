import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const ConnectionSchema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
    },
    note: { type: String, maxlength: 400, default: "" },

    // Per-user, explicit, revocable contact sharing. Keyed by the
    // sharing user's id (string) -> the field names they've chosen to
    // share with the other side of this connection. Nothing here is
    // ever populated by accepting a request — only by the owner taking
    // a separate, deliberate action on the /connections page.
    contactShares: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ConnectionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
ConnectionSchema.index({ toUser: 1, status: 1 });

export default models.Connection || model("Connection", ConnectionSchema);
