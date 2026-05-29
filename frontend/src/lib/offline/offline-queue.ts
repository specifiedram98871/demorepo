import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import { clearOfflineAction, queueOfflineAction, readOfflineActions } from "@/lib/offline/indexed-db";

export async function enqueueAction(type: "CREATE_ISSUE" | "MOVE_ISSUE" | "UPDATE_ISSUE", payload: Record<string, unknown>) {
  await queueOfflineAction({ type, payload, createdAt: new Date().toISOString() });
  toast.info("Action saved offline");
}

export async function flushOfflineQueue() {
  const actions = await readOfflineActions();
  for (const action of actions) {
    try {
      if (action.type === "MOVE_ISSUE") {
        await apiClient.patch(`/issues/${action.payload.issueId}/`, { status: action.payload.status });
      }
      if (action.id) {
        await clearOfflineAction(action.id);
      }
    } catch {
      break;
    }
  }
}
