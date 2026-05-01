import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "UTK Workspace",
  description: "Project and task management workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
