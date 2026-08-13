"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

export function AvatarUpload({ name, photoUrl, onUploaded, size = 72 }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(photoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error || "Upload failed.");
        setPreview(photoUrl);
        return;
      }

      const saveRes = await fetch("/api/profile/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: uploadData.url }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        setError(saveData.error || "Couldn't save your photo.");
        return;
      }
      setPreview(saveData.photoUrl);
      onUploaded?.(saveData.photoUrl);
    } catch {
      setError("Couldn't reach the server.");
      setPreview(photoUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar name={name} photoUrl={preview} size={size} />
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[10px] text-white">
            …
          </span>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink hover:border-maroon/40 hover:text-maroon disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
        />
        {error && <p className="mt-1.5 text-xs text-maroon">{error}</p>}
        {!error && <p className="mt-1.5 text-xs text-muted">JPG, PNG, WEBP or GIF, up to 5MB.</p>}
      </div>
    </div>
  );
}
