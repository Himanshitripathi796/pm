"use client";

import type { ProjectEntity, TaskStatus } from "@/types";

interface TaskFiltersProps {
  projects: ProjectEntity[];
  projectId: string;
  status: TaskStatus | "all";
  overdueOnly: boolean;
  onChange: (value: {
    projectId: string;
    status: TaskStatus | "all";
    overdueOnly: boolean;
  }) => void;
}

export function TaskFilters({
  projects,
  projectId,
  status,
  overdueOnly,
  onChange,
}: TaskFiltersProps) {
  return (
    <section className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-3">
      <label className="text-sm text-zinc-700">
        <span className="mb-1 block text-xs uppercase text-zinc-500">Project</span>
        <select
          value={projectId}
          onChange={(event) =>
            onChange({ projectId: event.target.value, status, overdueOnly })
          }
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-zinc-700">
        <span className="mb-1 block text-xs uppercase text-zinc-500">Status</span>
        <select
          value={status}
          onChange={(event) =>
            onChange({
              projectId,
              status: event.target.value as TaskStatus | "all",
              overdueOnly,
            })
          }
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        >
          <option value="all">All</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-700 md:pt-6">
        <input
          type="checkbox"
          checked={overdueOnly}
          onChange={(event) =>
            onChange({ projectId, status, overdueOnly: event.target.checked })
          }
          className="h-4 w-4"
        />
        Overdue only
      </label>
    </section>
  );
}
