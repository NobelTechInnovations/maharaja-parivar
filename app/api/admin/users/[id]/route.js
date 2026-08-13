import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import User from "@/models/User";
import { notify } from "@/lib/notify";
import { sendAccountApprovedEmail } from "@/lib/email";

export async function PATCH(request, { params }) {
  const { error, me } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const target = await User.findById(id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  target.verificationStatus = action === "approve" ? "verified" : "rejected";
  target.verificationRemarks = body?.remarks || "";
  target.verifiedAt = action === "approve" ? new Date() : undefined;
  await target.save();

  if (action === "approve") {
    await notify({ recipientId: target._id, actorId: me._id, type: "account_verified" });
    sendAccountApprovedEmail(target).catch(() => {});
  }

  return NextResponse.json({
    user: { id: target._id, verificationStatus: target.verificationStatus },
  });
}
