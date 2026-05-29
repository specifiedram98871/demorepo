import { apiClient } from "@/lib/api/client";
import type {
  CreateIssuePayload,
  CreateProjectPayload,
  Issue,
  IssueStatus,
  Organization,
  Project,
  UpdateIssuePayload,
  User,
} from "@/lib/api/types";

export const issueRepository = {
  async list(projectId?: number): Promise<Issue[]> {
    const response = await apiClient.get<Issue[]>("/issues/", {
      params: projectId ? { project: projectId } : {},
    });
    return response.data;
  },
  async updateStatus(issueId: number, status: IssueStatus) {
    const response = await apiClient.post<Issue>(`/issues/${issueId}/transition/`, { status });
    return response.data;
  },
  async getByKey(key: string) {
    const response = await apiClient.get<Issue[]>("/issues/", { params: { search: key } });
    return response.data.find((issue) => issue.key === key) ?? null;
  },
  async getShared(slug: string) {
    const response = await apiClient.get<Issue>(`/share/${slug}/`);
    return response.data;
  },
  async create(payload: CreateIssuePayload) {
    const response = await apiClient.post<Issue>("/issues/", payload);
    return response.data;
  },
  async update(issueId: number, payload: UpdateIssuePayload) {
    const response = await apiClient.patch<Issue>(`/issues/${issueId}/`, payload);
    return response.data;
  },
  async delete(issueId: number) {
    await apiClient.delete(`/issues/${issueId}/`);
  },
  async listProjects() {
    const response = await apiClient.get<Project[]>("/projects/");
    return response.data;
  },
  async listUsers() {
    const response = await apiClient.get<User[]>("/users/");
    return response.data;
  },
  async listOrganizations() {
    const response = await apiClient.get<Organization[]>("/organizations/");
    return response.data;
  },
  async createProject(payload: CreateProjectPayload) {
    const response = await apiClient.post<Project>("/projects/", payload);
    return response.data;
  },
};
