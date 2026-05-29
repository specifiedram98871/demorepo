"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { issueRepository } from "@/lib/repositories/issue-repository";

export default function SharedIssuePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["shared-issue", slug],
    queryFn: () => issueRepository.getShared(slug),
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading shared issue...</div>;
  }

  if (!data) {
    return <div className="text-sm text-slate-500">This share link is unavailable.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="space-y-3">
        <p className="text-xs uppercase text-slate-500">Public Issue Link</p>
        <h1 className="text-2xl font-bold">{data.key}: {data.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">{data.description || "No description"}</p>
      </Card>
    </div>
  );
}
