import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const CommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 600, trim: true },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, createdAt: 1 });

export default models.Comment || model("Comment", CommentSchema);
