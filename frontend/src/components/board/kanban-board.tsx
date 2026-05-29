"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { issueRepository } from "@/lib/repositories/issue-repository";
import { moveIssue } from "@/lib/services/issue-service";
import type { Issue, IssueStatus } from "@/lib/api/types";
import { ISSUE_STATUSES, STATUS_LABELS } from "@/lib/utils";
import { useBoardStore } from "@/store/board-store";
import { useAuthStore } from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";

function DraggableIssueCard({ issue }: { issue: Issue }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: issue.id });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setIssues = useBoardStore((s) => s.setIssues);
  const isAdmin = user?.role === "admin";
  const isOwner = user?.id === issue.reporter;
  const canModify = Boolean(isAdmin || isOwner);

  async function onDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete ${issue.key}? This cannot be undone.`)) return;
    try {
      await issueRepository.delete(issue.id);
      // optimistic update to board store
      setIssues((prev) => prev.filter((i) => i.id !== issue.id));
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Ticket deleted");
    } catch (err) {
      toast.error("Failed to delete ticket");
    }
  }

  return (
    <motion.div ref={setNodeRef} style={style} {...attributes} {...listeners} layout whileHover={{ y: -2 }}>
      <Card className="relative cursor-grab active:cursor-grabbing" style={{ opacity: isDragging ? 0.5 : 1 }}>
        {canModify && (
          <div className="absolute right-2 top-2 z-20 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/issue/${issue.key}`);
              }}
            >
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}

        <div className="mb-2 text-xs font-medium text-slate-500">{issue.key}</div>
        <CardTitle className="mb-3 text-sm">{issue.title}</CardTitle>
        <div className="flex items-center justify-between gap-2">
          <Badge className={priorityColor(issue.priority)}>{issue.priority}</Badge>
          <Badge>{issue.platform_type}</Badge>
        </div>
      </Card>
    </motion.div>
  );
}

function BoardColumn({ status, issues }: { status: IssueStatus; issues: Issue[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3 ${
        isOver
          ? "border-cyan-400 bg-cyan-50/80 dark:border-cyan-700 dark:bg-cyan-950/30"
          : "border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{STATUS_LABELS[status]}</h4>
        <Badge>{issues.length}</Badge>
      </div>
      <div className="min-h-24 space-y-3">
        {issues.map((issue: Issue) => (
          <DraggableIssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}

function priorityColor(priority: string) {
  const map: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-rose-100 text-rose-700",
  };
  return map[priority] ?? "bg-slate-100 text-slate-700";
}

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const { issues, setIssues, moveIssueLocal } = useBoardStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issueRepository.list(),
  });

  useEffect(() => {
    if (data) {
      setIssues(data);
    }
  }, [data, setIssues]);

  const moveMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: number; status: IssueStatus }) =>
      moveIssue(issueId, status, navigator.onLine),
    onError: (error) => {
      const message = isAxiosError(error) ? error.response?.data?.detail ?? "You are not allowed to move this ticket." : "You are not allowed to move this ticket.";
      toast.error(message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });

  function onDragEnd(event: DragEndEvent) {
    const issueId = Number(event.active.id);
    const destination = event.over?.id as IssueStatus | undefined;
    if (!destination || !ISSUE_STATUSES.includes(destination)) {
      return;
    }
    moveIssueLocal(issueId, destination);
    moveMutation.mutate({ issueId, status: destination });
  }

  const columns = ISSUE_STATUSES.map((status) => ({
    status,
    issues: issues.filter((issue) => issue.status === status),
  }));

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading board...</div>;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2">
        {columns.map((column) => (
          <BoardColumn key={column.status} status={column.status} issues={column.issues} />
        ))}
      </div>
    </DndContext>
  );
}
