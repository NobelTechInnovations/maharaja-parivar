import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await getSettings();
  return NextResponse.json({ autoApproveEnabled: settings.autoApproveEnabled });
}

export async function PATCH(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (typeof body?.autoApproveEnabled !== "boolean") {
    return NextResponse.json({ error: "autoApproveEnabled must be a boolean." }, { status: 400 });
  }

  const settings = await getSettings();
  settings.autoApproveEnabled = body.autoApproveEnabled;
  await settings.save();

  return NextResponse.json({ autoApproveEnabled: settings.autoApproveEnabled });
}
