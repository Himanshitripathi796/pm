"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { MemberManager } from "@/components/projects/member-manager";
import { ProjectForm } from "@/components/projects/project-form";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { parseApiResponse } from "@/lib/utils";
import type { ProjectEntity, ProjectMemberEntity, TaskEntity } from "@/types";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { user } = useAuth();

  const [project, setProject] = useState<ProjectEntity | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberEntity[]>([]);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [taskBeingEdited, setTaskBeingEdited] = useState<TaskEntity | null>(null);

  const { filteredTasks, isLoading, error, refreshTasks } = useTasks({
    projectId,
    status: "all",
  });

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await parseApiResponse<{ project: ProjectEntity }>(
          await fetch(`/api/projects/${projectId}`, { credentials: "include" })
        );
        setProject(data.project);
      } catch (err) {
        setProjectError(err instanceof Error ? err.message : "Failed to load project.");
      }
    }

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    async function loadProjectMembers() {
      try {
        const data = await parseApiResponse<{ members: ProjectMemberEntity[] }>(
          await fetch(`/api/projects/${projectId}/members`, { credentials: "include" })
        );
        setProjectMembers(data.members);
      } catch {
        setProjectMembers([]);
      }
    }

    void loadProjectMembers();
  }, [projectId]);

  async function handleProjectUpdate(values: { name: string; description: string }) {
    const data = await parseApiResponse<{ project: ProjectEntity }>(
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
    );
    setProject(data.project);
  }

  async function handleAddMember(userId: string) {
    const data = await parseApiResponse<{ project: ProjectEntity }>(
      await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      })
    );
    setProject(data.project);
    const membersData = await parseApiResponse<{ members: ProjectMemberEntity[] }>(
      await fetch(`/api/projects/${projectId}/members`, { credentials: "include" })
    );
    setProjectMembers(membersData.members);
  }

  async function handleRemoveMember(userId: string) {
    const data = await parseApiResponse<{ project: ProjectEntity }>(
      await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
    );
    setProject(data.project);
    const membersData = await parseApiResponse<{ members: ProjectMemberEntity[] }>(
      await fetch(`/api/projects/${projectId}/members`, { credentials: "include" })
    );
    setProjectMembers(membersData.members);
  }

  async function handleCreateTask(values: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo: string;
    status: TaskEntity["status"];
    dueDate?: string;
  }) {
    await parseApiResponse<{ task: TaskEntity }>(
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
    );
    await refreshTasks();
  }

  async function handleUpdateTask(values: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo: string;
    status: TaskEntity["status"];
    dueDate?: string;
  }) {
    if (!taskBeingEdited) {
      return;
    }
    await parseApiResponse<{ task: TaskEntity }>(
      await fetch(`/api/tasks/${taskBeingEdited._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
    );
    setTaskBeingEdited(null);
    await refreshTasks();
  }

  async function handleStatusChange(taskId: string, status: TaskEntity["status"]) {
    await parseApiResponse<{ task: TaskEntity }>(
      await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
    );
    await refreshTasks();
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {project?.name ?? "Project details"}
        </h1>
        <p className="text-sm text-zinc-500">{project?.description ?? ""}</p>
      </header>

      {projectError ? <p className="text-sm text-red-600">{projectError}</p> : null}

      {user?.role === "admin" && project ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ProjectForm
            initialValues={{ name: project.name, description: project.description }}
            submitLabel="Update project"
            onSubmit={handleProjectUpdate}
          />
          <MemberManager
            members={project.members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      ) : null}

      {user?.role === "admin" ? (
        <TaskForm
          projectId={projectId}
          assignees={projectMembers}
          submitLabel="Create task"
          onSubmit={handleCreateTask}
        />
      ) : null}

      {taskBeingEdited && user?.role === "admin" ? (
        <TaskForm
          projectId={projectId}
          assignees={projectMembers}
          initialValues={taskBeingEdited}
          submitLabel="Update task"
          onSubmit={handleUpdateTask}
        />
      ) : null}

      {isLoading ? <p className="text-sm text-zinc-500">Loading tasks...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            canManage={user?.role === "admin"}
            onEdit={(selectedTask) => setTaskBeingEdited(selectedTask)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </section>
    </section>
  );
}
