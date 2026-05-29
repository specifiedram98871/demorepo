"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardOverview } from "@/components/dashboard/overview";
import { issueRepository } from "@/lib/repositories/issue-repository";

export default function DashboardPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issueRepository.list(),
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Engineering Health</h2>
        <p className="text-slate-500">Live view of bugs, platform distribution, and sprint throughput.</p>
      </div>
      <DashboardOverview issues={data} />
    </section>
  );
}
