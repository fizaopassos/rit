"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const semNav = pathname.startsWith("/login");

  if (semNav) {
    return <>{children}</>;
  }

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
