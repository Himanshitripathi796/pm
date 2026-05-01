"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (isLoading) {
    return <div className="p-8 text-sm text-zinc-500">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="min-h-[calc(100vh-64px)] flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
