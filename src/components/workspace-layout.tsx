import type { ReactNode } from "react";
import { SideNav } from "@/components/side-nav";
import type { NavItem } from "@/lib/navigation";

type WorkspaceLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: ReactNode;
  onLogout?: () => void;
};

export function WorkspaceLayout({
  title,
  subtitle,
  navItems,
  children,
  onLogout,
}: WorkspaceLayoutProps) {
  return (
    <div className="app-shell min-h-screen px-4 py-8 md:px-10 md:py-10">
      <div className="mx-auto grid w-full max-w-[1120px] gap-5 lg:grid-cols-[260px_1fr]">
        <SideNav title={title} subtitle={subtitle} navItems={navItems} onLogout={onLogout} />
        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}