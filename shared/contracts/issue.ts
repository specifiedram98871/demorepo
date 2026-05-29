export type IssuePriority = "low" | "medium" | "high" | "critical";
export type IssueStatus = "backlog" | "todo" | "in_progress" | "review" | "testing" | "done";

export interface IssueContract {
  id: number;
  key: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  platform_type: "web" | "mobile";
  mobile_subtype: "ios" | "android" | "";
  labels: string[];
  assignee: number | null;
  reporter: number | null;
  share_slug: string;
}
