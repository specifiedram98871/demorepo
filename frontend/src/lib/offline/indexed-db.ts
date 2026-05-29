import { DBSchema, openDB } from "idb";

export type OfflineAction = {
  id?: number;
  type: "CREATE_ISSUE" | "MOVE_ISSUE" | "UPDATE_ISSUE";
  payload: Record<string, unknown>;
  createdAt: string;
};

interface BugTrackerDB extends DBSchema {
  drafts: {
    key: string;
    value: { key: string; value: string; updatedAt: string };
  };
  queue: {
    key: number;
    value: OfflineAction;
  };
}

let dbPromise: ReturnType<typeof openDB<BugTrackerDB>> | null = null;

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is available only in the browser.");
  }
  if (!dbPromise) {
    dbPromise = openDB<BugTrackerDB>("bug-tracker-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("queue")) {
          db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDraft(key: string, value: string) {
  const db = await getDb();
  return db.put("drafts", { key, value, updatedAt: new Date().toISOString() });
}

export async function queueOfflineAction(action: OfflineAction) {
  const db = await getDb();
  return db.add("queue", action);
}

export async function readOfflineActions() {
  const db = await getDb();
  return db.getAll("queue");
}

export async function clearOfflineAction(id: number) {
  const db = await getDb();
  return db.delete("queue", id);
}
