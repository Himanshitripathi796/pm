"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { isOverdue, parseApiResponse } from "@/lib/utils";
import type { TaskEntity, TaskStatus } from "@/types";

export interface TaskFilterState {
  projectId?: string;
  status?: TaskStatus | "all";
  overdue?: boolean;
}

export function useTasks(filters: TaskFilterState = {}) {
  const [tasks, setTasks] = useState<TaskEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.projectId) {
        params.set("projectId", filters.projectId);
      }
      if (filters.status && filters.status !== "all") {
        params.set("status", filters.status);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/tasks?${queryString}` : "/api/tasks";

      const data = await parseApiResponse<{ tasks: TaskEntity[] }>(
        await fetch(endpoint, { credentials: "include" })
      );
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.projectId, filters.status]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshTasks();
    });
  }, [refreshTasks]);

  const filteredTasks = useMemo(() => {
    if (!filters.overdue) {
      return tasks;
    }

    return tasks.filter(
      (task) => task.status !== "done" && task.dueDate && isOverdue(task.dueDate)
    );
  }, [filters.overdue, tasks]);

  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    refreshTasks,
    setTasks,
  };
}
