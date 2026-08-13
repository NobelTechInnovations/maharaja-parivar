import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const NOTIFICATION_TYPES = [
  "follow",
  "connection_request",
  "connection_accepted",
  "message",
  "post_like",
  "post_comment",
];

const NotificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    // Small, type-specific payload used to build the link/text — e.g.
    // { connectionId } or { postId } or { conversationId }.
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, read: 1 });

export default models.Notification || model("Notification", NotificationSchema);
export { NOTIFICATION_TYPES };
