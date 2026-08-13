import Notification from "@/models/Notification";

/**
 * Fire-and-forget notification creation — never notify someone about
 * their own action, and never let a notification failure break the
 * request that triggered it.
 */
export async function notify({ recipientId, actorId, type, data = {} }) {
  if (!recipientId || !actorId) return;
  if (String(recipientId) === String(actorId)) return;

  try {
    await Notification.create({ recipientId, actorId, type, data });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
}
