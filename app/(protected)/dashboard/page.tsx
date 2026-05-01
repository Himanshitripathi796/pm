"use client";

import { useMemo, useState } from "react";

import { StatCard } from "@/components/dashboard/stat-card";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { TaskFilters } from "@/components/tasks/task-filters";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { isOverdue, parseApiResponse } from "@/lib/utils";
import type { TaskEntity, TaskStatus } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const { projects } = useProjects();
  const { filteredTasks, isLoading, error, refreshTasks } = useTasks({
    projectId: projectId || undefined,
    status,
    overdue: overdueOnly,
  });

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((task) => task.status === "done").length;
    const pending = filteredTasks.filter((task) => task.status !== "done").length;
    const overdue = filteredTasks.filter(
      (task) => task.status !== "done" && task.dueDate && isOverdue(task.dueDate)
    ).length;
    return { total, completed, pending, overdue };
  }, [filteredTasks]);

  async function handleStatusChange(taskId: string, nextStatus: TaskEntity["status"]) {
    await parseApiResponse<{ task: TaskEntity }>(
      await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      })
    );
    await refreshTasks();
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Welcome back, {user?.name ?? "user"}.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Overdue" value={stats.overdue} />
      </div>

      <TaskFilters
        projects={projects}
        projectId={projectId}
        status={status}
        overdueOnly={overdueOnly}
        onChange={(value) => {
          setProjectId(value.projectId);
          setStatus(value.status);
          setOverdueOnly(value.overdueOnly);
        }}
      />

      {isLoading ? <p className="text-sm text-zinc-500">Loading tasks...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!isLoading && !error ? (
        <TaskOverview
          tasks={filteredTasks}
          canManage={user?.role === "admin"}
          onStatusChange={handleStatusChange}
        />
      ) : null}
    </section>
  );
}
