"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { parseApiResponse } from "@/lib/utils";
import type { ProjectEntity } from "@/types";

export function useProjects(search = "") {
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parseApiResponse<{ projects: ProjectEntity[] }>(
        await fetch("/api/projects", { credentials: "include" })
      );
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshProjects();
    });
  }, [refreshProjects]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return projects;
    }
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return {
    projects,
    filteredProjects,
    isLoading,
    error,
    refreshProjects,
    setProjects,
  };
}
