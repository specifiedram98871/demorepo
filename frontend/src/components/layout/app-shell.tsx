"use client";

import { motion } from "framer-motion";
import { Bell, Columns3, FolderPlus, LayoutDashboard, Moon, PlusCircle, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/board", label: "Board", icon: Columns3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [showPalette, setShowPalette] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowPalette((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isPublicRoute = pathname.startsWith("/login") || pathname.startsWith("/share");

  if (isPublicRoute) {
    return <div className="min-h-screen p-4 md:p-8">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#f8fafc_35%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_#0f172a_0,_#020617_50%,_#020617_100%)]">
      <aside className="hidden w-72 border-r border-slate-200/70 bg-white/80 p-5 backdrop-blur lg:block dark:border-slate-800 dark:bg-slate-950/60">
        <h1 className="mb-6 text-xl font-bold tracking-tight">PulseBoard</h1>
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  pathname.startsWith(link.href)
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/project/new"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                pathname.startsWith("/project/new")
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              <FolderPlus className="h-4 w-4" />
              Create Project
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/issue/new"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                pathname.startsWith("/issue/new")
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              <PlusCircle className="h-4 w-4" />
              Create Ticket
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <Button variant="outline" onClick={() => setShowPalette((prev) => !prev)}>
            <Search className="mr-2 h-4 w-4" /> Command Palette
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 md:p-6"
        >
          {showPalette && (
            <div className="mb-4 rounded-2xl border border-cyan-300 bg-cyan-50 p-3 text-sm text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100">
              Quick actions: Press Ctrl/Cmd + K to open global search and jump to issues.
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  );
}
