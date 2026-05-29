"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardTitle } from "@/components/ui/card";
import type { Issue } from "@/lib/api/types";

export function DashboardOverview({ issues }: { issues: Issue[] }) {
  const openCount = issues.filter((i) => i.status !== "done").length;
  const byStatus = useMemo(
    () =>
      ["backlog", "todo", "in_progress", "review", "testing", "done"].map((status) => ({
        status,
        total: issues.filter((issue) => issue.status === status).length,
      })),
    [issues],
  );
  const byPlatform = useMemo(
    () =>
      ["web", "mobile"].map((platform) => ({
        name: platform,
        total: issues.filter((i) => i.platform_type === platform).length,
      })),
    [issues],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Open Bugs</p>
          <CardTitle className="text-3xl">{openCount}</CardTitle>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Issues</p>
          <CardTitle className="text-3xl">{issues.length}</CardTitle>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Sprint Progress</p>
          <CardTitle className="text-3xl">
            {issues.length ? Math.round((issues.filter((i) => i.status === "done").length / issues.length) * 100) : 0}%
          </CardTitle>
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-4">Tickets by Status</CardTitle>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 xl:grid-cols-6">
          {byStatus.map((item) => (
            <div key={item.status} className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-500">{item.status.replace("_", " ")}</p>
              <p className="text-xl font-semibold">{item.total}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="h-72">
        <CardTitle className="mb-4">Bugs by Platform</CardTitle>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byPlatform}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Bar dataKey="total" fill="#0e7490" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
