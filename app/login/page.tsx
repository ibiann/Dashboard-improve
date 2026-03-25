"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { Checkbox } from "@/components/ui/checkbox";
import type { AppRole } from "@/components/auth/auth-context";
import { Eye, EyeOff, Mail, Lock, Network } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { ready, isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = useMemo(
    () =>
      [
        { role: "CEO" as const, email: "ceo@lancs.vn", password: "123456" },
        { role: "CTO" as const, email: "cto@lancs.vn", password: "123456" },
        { role: "PM" as const, email: "pm.alice@lancs.vn", password: "123456" },
        { role: "KS" as const, email: "james@lancs.vn", password: "123456" },
      ] as const,
    [],
  );

  function inferRoleFromEmail(inputEmail: string): AppRole {
    const v = inputEmail.trim().toLowerCase();
    const map: Record<string, AppRole> = {
      "ceo@lancs.vn": "CEO",
      "cto@lancs.vn": "CTO",
      "pm.alice@lancs.vn": "PM",
      "james@lancs.vn": "Engineer",
    };
    return map[v] ?? "CTO";
  }

  function inferDisplayName(inputEmail: string): string {
    const v = inputEmail.trim().toLowerCase();
    const local = v.split("@")[0] ?? v;
    const lastPart = local.includes(".") ? local.split(".").slice(-1)[0] : local;
    const cleaned = lastPart.replace(/[^a-z0-9]/gi, "");
    if (!cleaned) return "User";
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated) router.replace("/");
  }, [ready, isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!email.trim()) {
        throw new Error("Vui lòng nhập Email.");
      }
      if (!password) {
        throw new Error("Vui lòng nhập Mật khẩu.");
      }

      const role = inferRoleFromEmail(email);
      const displayName = inferDisplayName(email);

      // Note: rememberMe is UI-only in this demo (demo auth uses localStorage).
      void rememberMe;

      await login({ username: displayName, password, role });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "#063986" }}
          >
            <Network className="w-6 h-6 text-white" />
          </div>
          <h1 className="mt-3 text-base font-extrabold text-foreground">Lancsnetworks</h1>
          <p className="text-xs text-muted-foreground">Hệ thống Quản lý Dữ án Lancs Networks</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-5">
            <CardTitle className="text-center">Đăng nhập hệ thống QLDA</CardTitle>
            <CardDescription className="text-center">
              Demo (chưa kết nối backend). Sử dụng tài khoản bên dưới.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <span>Email</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@lancsnetworks.vn"
                    autoComplete="email"
                    inputMode="email"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <span>Mật khẩu</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(Boolean(v))}
                />
                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-[#063986] text-white hover:bg-[#052d6b]"
                disabled={submitting}
              >
                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="text-center pt-1">
                <a href="#" className="text-xs text-primary hover:underline" onClick={(ev) => ev.preventDefault()}>
                  Quên mật khẩu?
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="w-full border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Demo accounts:</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6">
            {demoAccounts.map((a) => (
              <div key={a.email}>
                <span className="font-semibold">{a.role}:</span> {a.email}
              </div>
            ))}
            <div className="mt-2">
              Mật khẩu: <span className="font-semibold">123456</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

