import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const PostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Not required at the schema level — a post can be image-only. The
    // route validates that at least one of text/imageUrl is present.
    text: { type: String, maxlength: 2000, trim: true, default: "" },
    imageUrl: { type: String, default: "" },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

export default models.Post || model("Post", PostSchema);
