import Link from "next/link";

import type { ProjectEntity } from "@/types";

interface ProjectCardProps {
  project: ProjectEntity;
  canManage: boolean;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, canManage, onDelete }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{project.name}</h3>
        <span className="text-xs text-zinc-500">
          {project.members.length} member{project.members.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">{project.description}</p>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/projects/${project._id}`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Open
        </Link>
        {canManage && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(project._id)}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
