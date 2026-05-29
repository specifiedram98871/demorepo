"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import type { AuthSessionResponse } from "@/lib/api/types";
import { useAuthStore } from "@/store/auth-store";

type LoginMode = "admin" | "user";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<LoginMode>("user");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post<AuthSessionResponse>("/auth/login/", { username, password });
      const { user, tokens } = response.data;

      if (mode === "admin" && user.role !== "admin") {
        toast.error("This account is not an admin account");
        return;
      }

      if (mode === "user" && user.role === "admin") {
        toast.error("Select admin to continue with this account");
        return;
      }

      setSession(tokens.access, tokens.refresh, user);
      toast.success("Logged in");
      router.push(user.role === "admin" ? "/dashboard" : "/board");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[78vh] w-full max-w-5xl items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(2,6,23,0.55),_transparent_30%)]" />
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">PulseBoard</p>
            <h1 className="max-w-lg text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Sign in with the account type you actually use.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Admins can create, edit, assign, and delete tickets. Normal users stay focused on the board and their assigned work.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Local token storage", "Access and refresh tokens persist on this device."],
              ["Role aware flow", "Use the admin/user toggle to route correctly after sign-in."],
              ["Faster resume", "You stay signed in across reloads until refresh expires."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="w-full self-center border-slate-200/70 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500">Choose the access path that matches your account.</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
              <label className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${mode === "user" ? "border-slate-900 bg-white text-slate-900 shadow-sm dark:border-slate-100 dark:bg-slate-950 dark:text-white" : "border-transparent text-slate-500 hover:bg-white/70 dark:hover:bg-slate-800"}`}>
                <input className="sr-only" type="radio" name="mode" value="user" checked={mode === "user"} onChange={() => setMode("user")} />
                <span className="block font-semibold">Normal user</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Board access and assigned work</span>
              </label>
              <label className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${mode === "admin" ? "border-slate-900 bg-white text-slate-900 shadow-sm dark:border-slate-100 dark:bg-slate-950 dark:text-white" : "border-transparent text-slate-500 hover:bg-white/70 dark:hover:bg-slate-800"}`}>
                <input className="sr-only" type="radio" name="mode" value="admin" checked={mode === "admin"} onChange={() => setMode("admin")} />
                <span className="block font-semibold">Admin</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Create, edit, assign, delete</span>
              </label>
            </div>

            <input
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
            />
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            <Button className="h-11 w-full rounded-2xl" disabled={loading}>
              {loading ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
