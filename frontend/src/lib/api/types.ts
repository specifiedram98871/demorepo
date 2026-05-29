export type UserRole = "admin" | "project_manager" | "developer" | "viewer";

export type IssueStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "testing"
  | "done";

export type Priority = "low" | "medium" | "high" | "critical";
export type PlatformType = "web" | "mobile";
export type MobileSubtype = "ios" | "android" | "";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface Project {
  id: number;
  name: string;
  key: string;
  description: string;
  organization: number;
  created_by: number | null;
  created_at: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  owner: number;
  created_at: string;
}

export interface Issue {
  id: number;
  key: string;
  title: string;
  description: string;
  priority: Priority;
  status: IssueStatus;
  platform_type: PlatformType;
  mobile_subtype: MobileSubtype;
  labels: string[];
  attachments: string[];
  assignee: number | null;
  reporter: number | null;
  due_date: string | null;
  share_slug: string;
  is_share_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateIssuePayload {
  project: number;
  title: string;
  description?: string;
  priority: Priority;
  status?: IssueStatus;
  platform_type?: PlatformType;
  mobile_subtype?: MobileSubtype;
  labels?: string[];
  attachments?: string[];
  assignee?: number | null;
  due_date?: string | null;
  is_share_public?: boolean;
}

export type UpdateIssuePayload = Partial<CreateIssuePayload>;

export interface CreateProjectPayload {
  name: string;
  key: string;
  description?: string;
  organization: number;
}

export interface AuthPayload {
  access: string;
  refresh: string;
}

export interface AuthSessionResponse {
  user: User;
  tokens: AuthPayload;
}
