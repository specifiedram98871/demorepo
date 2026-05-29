import { create } from "zustand";

import type { Issue, IssueStatus } from "@/lib/api/types";

type BoardState = {
  issues: Issue[];
  setIssues: (issues: Issue[]) => void;
  moveIssueLocal: (issueId: number, status: IssueStatus) => void;
};

export const useBoardStore = create<BoardState>((set) => ({
  issues: [],
  setIssues: (issues) => set({ issues }),
  moveIssueLocal: (issueId, status) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status,
            }
          : issue,
      ),
    })),
}));
