import { formatDate, isOverdue } from "@/lib/utils";
import type { TaskEntity } from "@/types";

import { TaskStatusBadge } from "./task-status-badge";

interface TaskCardProps {
  task: TaskEntity;
  assigneeName?: string;
  canManage: boolean;
  onEdit?: (task: TaskEntity) => void;
  onStatusChange?: (taskId: string, status: TaskEntity["status"]) => void;
}

const statuses: TaskEntity["status"][] = ["todo", "in-progress", "done"];

export function TaskCard({
  task,
  assigneeName,
  canManage,
  onEdit,
  onStatusChange,
}: TaskCardProps) {
  const overdue = task.status !== "done" && task.dueDate && isOverdue(task.dueDate);

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        {task.description?.trim() ? task.description : "No description."}
      </p>

      <div className="mt-3 text-xs text-zinc-500">
        <p>Assignee: {assigneeName ?? task.assignedTo}</p>
        <p>Due: {formatDate(task.dueDate)}</p>
        {overdue ? <p className="font-medium text-red-600">Overdue</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onStatusChange
          ? statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(task._id, status)}
                className={`rounded-md border px-2 py-1 text-xs ${
                  task.status === status
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {status}
              </button>
            ))
          : null}

        {canManage && onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            Edit
          </button>
        ) : null}
      </div>
    </article>
  );
}
