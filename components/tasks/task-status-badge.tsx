import type { TaskStatus } from "@/types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const badgeByStatus: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeByStatus[status]}`}
    >
      {status}
    </span>
  );
}
