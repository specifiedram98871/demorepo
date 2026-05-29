"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Issue, IssueStatus, Priority } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { issueRepository } from "@/lib/repositories/issue-repository";
import { useAuthStore } from "@/store/auth-store";

export default function IssueDetailPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["issue", key],
    queryFn: () => issueRepository.getByKey(key),
  });

  if (!data) {
    return <div className="text-sm text-slate-500">Issue not found.</div>;
  }

  return (
    <Card className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Ticket</p>
          <h2 className="text-3xl font-bold tracking-tight">{data.key}</h2>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{data.title}</p>
        </div>
      </div>

      {isAdmin ? (
        <IssueEditor
          issue={data}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          queryKey={key}
          queryClient={queryClient}
          router={router}
          saving={saving}
          setSaving={setSaving}
        />
      ) : (
        <>
          <p className="text-slate-600 dark:text-slate-300">{data.description || "No description."}</p>
          <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              Priority: <span className="font-medium text-slate-900 dark:text-slate-100">{data.priority}</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              Status: <span className="font-medium text-slate-900 dark:text-slate-100">{data.status}</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Share URL: <Link href={`/share/${data.share_slug}`} className="underline">/share/{data.share_slug}</Link>
          </div>
        </>
      )}
    </Card>
  );
}

function IssueEditor({
  issue,
  isEditing,
  setIsEditing,
  queryKey,
  queryClient,
  router,
  saving,
  setSaving,
}: {
  issue: Issue;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  queryKey: string;
  queryClient: ReturnType<typeof useQueryClient>;
  router: ReturnType<typeof useRouter>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [form, setForm] = useState({
    title: issue.title,
    description: issue.description ?? "",
    priority: issue.priority,
    status: issue.status,
    is_share_public: issue.is_share_public,
  });

  async function onSave(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    try {
      const updated = await issueRepository.update(issue.id, form);
      queryClient.setQueryData(["issue", queryKey], updated);
      toast.success("Ticket updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update ticket");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    const confirmed = window.confirm(`Delete ${issue.key}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      await issueRepository.delete(issue.id);
      toast.success("Ticket deleted");
      router.push("/board");
    } catch {
      toast.error("Failed to delete ticket");
    } finally {
      setSaving(false);
    }
  }

  return isEditing ? (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900" onSubmit={onSave}>
      <input
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Title"
      />
      <textarea
        className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="Description"
      />
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          value={form.priority}
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as Priority }))}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          value={form.status}
          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as IssueStatus }))}
        >
          <option value="backlog">Backlog</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="review">Review</option>
          <option value="testing">Testing</option>
          <option value="done">Done</option>
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <input
            type="checkbox"
            checked={form.is_share_public}
            onChange={(e) => setForm((prev) => ({ ...prev, is_share_public: e.target.checked }))}
          />
          Public share link
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => setIsEditing(false)} disabled={saving}>
          Close
        </Button>
        <Button variant="outline" type="button" onClick={onDelete} disabled={saving}>
          Delete
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  ) : (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsEditing(true)} disabled={saving}>
          Edit ticket
        </Button>
        <Button variant="outline" onClick={onDelete} disabled={saving}>
          Delete
        </Button>
      </div>
      <p className="text-slate-600 dark:text-slate-300">{issue.description || "No description."}</p>
      <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          Priority: <span className="font-medium text-slate-900 dark:text-slate-100">{issue.priority}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          Status: <span className="font-medium text-slate-900 dark:text-slate-100">{issue.status}</span>
        </div>
      </div>
      <div className="text-sm text-slate-500">
        Share URL: <Link href={`/share/${issue.share_slug}`} className="underline">/share/{issue.share_slug}</Link>
      </div>
    </>
  );
}
