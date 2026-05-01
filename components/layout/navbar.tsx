"use client";

import Link from "next/link";

import type { SafeUser } from "@/types";

interface NavbarProps {
  user: SafeUser | null;
  onLogout: () => Promise<void>;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
          UTK Workspace
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-700">
            <p className="font-medium">{user?.name ?? "Unknown user"}</p>
            <p className="text-xs uppercase text-zinc-500">{user?.role ?? "-"}</p>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
