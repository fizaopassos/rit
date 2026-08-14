"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const semChrome = pathname.startsWith("/login");

  if (semChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="flex min-h-screen flex-col pl-24">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
