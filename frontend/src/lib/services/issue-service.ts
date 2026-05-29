import { issueRepository } from "@/lib/repositories/issue-repository";
import { enqueueAction } from "@/lib/offline/offline-queue";
import type { IssueStatus } from "@/lib/api/types";

export async function moveIssue(issueId: number, status: IssueStatus, isOnline: boolean) {
  if (!isOnline) {
    await enqueueAction("MOVE_ISSUE", { issueId, status });
    return null;
  }
  return issueRepository.updateStatus(issueId, status);
}
