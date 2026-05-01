"use client";

import { type FormEvent, useState } from "react";

interface MemberManagerProps {
  members: string[];
  onAddMember: (userId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function MemberManager({
  members,
  onAddMember,
  onRemoveMember,
}: MemberManagerProps) {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (userId.trim().length !== 24) {
      setError("User id must be 24 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onAddMember(userId.trim());
      setUserId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Members</h3>
      <form onSubmit={handleAdd} className="mt-3 flex gap-2">
        <input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="User id (24 chars)"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-3 space-y-2">
        {members.map((memberId) => (
          <li key={memberId} className="flex items-center justify-between text-sm">
            <span className="font-mono text-xs text-zinc-600">{memberId}</span>
            <button
              type="button"
              onClick={() => void onRemoveMember(memberId)}
              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
