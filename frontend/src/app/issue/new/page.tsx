"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Priority, Project } from "@/lib/api/types";
import { issueRepository } from "@/lib/repositories/issue-repository";
import { useAuthStore } from "@/store/auth-store";

export default function NewIssuePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    project: number;
    title: string;
    description: string;
    priority: Priority;
  }>({
    project: 0,
    title: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Access denied: admin only");
      router.push("/dashboard");
      return;
    }
    issueRepository.listProjects().then(setProjects).catch(() => toast.error("Failed to load projects"));
  }, [user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await issueRepository.create({
        project: Number(form.project),
        title: form.title,
        description: form.description,
        priority: form.priority,
      });
      toast.success("Issue created");
      router.push("/board");
    } catch {
      toast.error("Failed to create issue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Create New Issue</h2>
        {projects.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p>You need at least one project before creating a ticket.</p>
            <Link href="/project/new">
              <Button>Create Project First</Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <select
              value={form.project}
              onChange={(e) => setForm({ ...form, project: Number(e.target.value) })}
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value={0}>Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              className="w-full rounded-xl border px-3 py-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
            />
            <div className="flex gap-2">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="rounded-xl border px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <Button type="submit" disabled={loading || !form.project || !form.title}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
