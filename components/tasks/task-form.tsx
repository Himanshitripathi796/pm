"use client";

import { type FormEvent, useMemo, useState } from "react";

import { createTaskSchema } from "@/schemas/task";
import type { ProjectMemberEntity, TaskEntity } from "@/types";

interface TaskFormProps {
  projectId: string;
  assignees: ProjectMemberEntity[];
  initialValues?: TaskEntity;
  submitLabel?: string;
  onSubmit: (values: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo: string;
    status: TaskEntity["status"];
    dueDate?: string;
  }) => Promise<void>;
}

export function TaskForm({
  projectId,
  assignees,
  initialValues,
  submitLabel = "Save task",
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [assignedTo, setAssignedTo] = useState(initialValues?.assignedTo ?? "");
  const [status, setStatus] = useState<TaskEntity["status"]>(
    initialValues?.status ?? "todo"
  );
  const [dueDate, setDueDate] = useState(
    initialValues?.dueDate ? new Date(initialValues.dueDate).toISOString().slice(0, 10) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  const filteredAssignees = useMemo(() => {
    const query = assigneeSearch.trim().toLowerCase();
    if (!query) {
      return assignees;
    }
    return assignees.filter((assignee) => {
      return (
        assignee.name.toLowerCase().includes(query) || assignee.email.toLowerCase().includes(query)
      );
    });
  }, [assigneeSearch, assignees]);
  const selectedAssignee = useMemo(() => {
    if (!assignedTo) {
      return null;
    }
    return assignees.find((assignee) => assignee._id === assignedTo) ?? null;
  }, [assignedTo, assignees]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = createTaskSchema.safeParse({
      projectId,
      title,
      description,
      assignedTo,
      status,
      dueDate: dueDate || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid task details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        projectId,
        title: parsed.data.title,
        description: parsed.data.description,
        assignedTo: parsed.data.assignedTo,
        status: parsed.data.status,
        dueDate: dueDate || undefined,
      });
      if (!initialValues) {
        setTitle("");
        setDescription("");
        setAssignedTo("");
        setStatus("todo");
        setDueDate("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Task details</h3>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Task title"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="min-h-20 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Description"
      />
      <input
        value={assigneeSearch}
        onChange={(event) => setAssigneeSearch(event.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Search assignee by name"
      />
      <select
        value={assignedTo}
        onChange={(event) => setAssignedTo(event.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        <option value="">Select assignee</option>
        {filteredAssignees.map((assignee) => (
          <option key={assignee._id} value={assignee._id}>
            {assignee.name} ({assignee.email})
          </option>
        ))}
      </select>
      {selectedAssignee ? (
        <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
          <p className="text-zinc-700">
            Selected: {selectedAssignee.name} ({selectedAssignee.email})
          </p>
          <button
            type="button"
            onClick={() => setAssignedTo("")}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-white"
          >
            Cancel selection
          </button>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskEntity["status"])}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
