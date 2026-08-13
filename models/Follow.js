import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

// One-way, no-approval-needed — deliberately lighter weight than
// Connection. Following someone never reveals contact details; it's
// just "show me their updates and let them know I'm interested."
const FollowSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1 });

export default models.Follow || model("Follow", FollowSchema);
