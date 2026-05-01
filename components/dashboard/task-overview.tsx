import type { TaskEntity } from "@/types";

import { TaskCard } from "@/components/tasks/task-card";

interface TaskOverviewProps {
  tasks: TaskEntity[];
  canManage: boolean;
  onStatusChange: (taskId: string, status: TaskEntity["status"]) => void;
}

export function TaskOverview({ tasks, canManage, onStatusChange }: TaskOverviewProps) {
  if (!tasks.length) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        No tasks found for current filters.
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          canManage={canManage}
          onStatusChange={onStatusChange}
        />
      ))}
    </section>
  );
}
