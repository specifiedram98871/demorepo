import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ISSUE_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "testing",
  "done",
] as const;

export const STATUS_LABELS: Record<(typeof ISSUE_STATUSES)[number], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  testing: "Testing",
  done: "Done",
};
