"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { parseApiResponse } from "@/lib/utils";
import type { ProjectEntity } from "@/types";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { projects, isLoading, error, refreshProjects } = useProjects(search);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
    );
  }, [projects, search]);

  async function handleCreateProject(values: {
    name: string;
    description: string;
  }) {
    await parseApiResponse<{ project: ProjectEntity }>(
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
    );
    setShowCreate(false);
    await refreshProjects();
  }

  async function handleDeleteProject(projectId: string) {
    await parseApiResponse<{ deleted: boolean }>(
      await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      })
    );
    await refreshProjects();
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Projects</h1>
          <p className="text-sm text-zinc-500">Browse and manage project spaces.</p>
        </div>
        {user?.role === "admin" ? (
          <button
            type="button"
            onClick={() => setShowCreate((value) => !value)}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            {showCreate ? "Close create" : "Create project"}
          </button>
        ) : null}
      </header>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search projects..."
        className="w-full rounded-md border border-zinc-300 px-3 py-2"
      />

      {showCreate && user?.role === "admin" ? (
        <ProjectForm submitLabel="Create project" onSubmit={handleCreateProject} />
      ) : null}

      {isLoading ? <p className="text-sm text-zinc-500">Loading projects...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            canManage={user?.role === "admin"}
            onDelete={handleDeleteProject}
          />
        ))}
      </section>
    </section>
  );
}
