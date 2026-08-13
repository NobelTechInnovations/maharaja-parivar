import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireSignedIn } from "@/lib/memberGuard";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Vercel's serverless functions have a read-only filesystem outside /tmp,
// and /tmp doesn't survive between requests — so a real disk write only
// works in local dev. On Vercel we fall back to a base64 data URI stored
// straight in the document (User.photoUrl / Post.imageUrl are already
// plain strings, so no schema change needed). That works everywhere with
// zero extra setup, but bloats documents — swap this for Vercel
// Blob/Cloudinary/S3 once you want real scale; the response shape
// (`{ url }`) won't need to change for callers either way.
const IS_SERVERLESS = Boolean(process.env.VERCEL);
const MAX_BYTES = IS_SERVERLESS ? 1.5 * 1024 * 1024 : 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request) {
  const { error } = await requireSignedIn();
  if (error) return error;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP or GIF images are supported." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    const limitMb = (MAX_BYTES / (1024 * 1024)).toFixed(1);
    return NextResponse.json({ error: `Images must be under ${limitMb}MB.` }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (IS_SERVERLESS) {
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;
    return NextResponse.json({ url: dataUrl }, { status: 201 });
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    await writeFile(path.join(UPLOAD_DIR, filename), bytes);
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    console.error("Local upload write failed:", err.message);
    return NextResponse.json(
      { error: "Couldn't save the image. Please try again." },
      { status: 500 }
    );
  }
}
