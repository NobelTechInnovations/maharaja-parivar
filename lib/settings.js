import Settings from "@/models/Settings";

/** Fetches the singleton settings document, creating it on first use. */
export async function getSettings() {
  let doc = await Settings.findOne({ key: "global" });
  if (!doc) doc = await Settings.create({ key: "global" });
  return doc;
}
