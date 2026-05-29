"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Organization } from "@/lib/api/types";
import { issueRepository } from "@/lib/repositories/issue-repository";
import { useAuthStore } from "@/store/auth-store";

export default function NewProjectPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", key: "", description: "", organization: 0 });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Access denied: admin only");
      router.push("/dashboard");
      return;
    }

    issueRepository
      .listOrganizations()
      .then((items) => {
        setOrganizations(items);
        if (items.length === 1) {
          setForm((prev) => ({ ...prev, organization: items[0].id }));
        }
      })
      .catch(() => toast.error("Failed to load organizations"));
  }, [user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organization) {
      toast.error("Select organization");
      return;
    }

    setLoading(true);
    try {
      await issueRepository.createProject({
        name: form.name,
        key: form.key.toUpperCase(),
        description: form.description,
        organization: form.organization,
      });
      toast.success("Project created");
      router.push("/issue/new");
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Create Project</h2>

        {organizations.length === 0 ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            You are not a member of any organization yet. Create an organization first via API, then create project.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <select
              value={form.organization}
              onChange={(e) => setForm((prev) => ({ ...prev, organization: Number(e.target.value) }))}
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value={0}>Select organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>

            <input
              className="w-full rounded-xl border px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Project name"
            />

            <input
              className="w-full rounded-xl border px-3 py-2"
              value={form.key}
              onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value.toUpperCase().slice(0, 12) }))}
              placeholder="Project key (e.g. BUG)"
            />

            <textarea
              className="w-full rounded-xl border px-3 py-2"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
            />

            <Button type="submit" disabled={loading || !form.name.trim() || !form.key.trim()}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
