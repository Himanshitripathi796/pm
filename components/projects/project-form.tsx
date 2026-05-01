"use client";

import { type FormEvent, useState } from "react";

import { createProjectSchema } from "@/schemas/project";

interface ProjectFormProps {
  initialValues?: {
    name: string;
    description: string;
  };
  submitLabel?: string;
  onSubmit: (values: { name: string; description: string }) => Promise<void>;
}

export function ProjectForm({
  initialValues,
  submitLabel = "Save project",
  onSubmit,
}: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = createProjectSchema.safeParse({
      name,
      description,
      members: [],
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid project details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: parsed.data.name, description: parsed.data.description });
      if (!initialValues) {
        setName("");
        setDescription("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Project details</h3>
      <label className="block text-sm text-zinc-700">
        <span className="mb-1 block text-xs uppercase text-zinc-500">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Project name"
        />
      </label>
      <label className="block text-sm text-zinc-700">
        <span className="mb-1 block text-xs uppercase text-zinc-500">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Project description"
        />
      </label>
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
