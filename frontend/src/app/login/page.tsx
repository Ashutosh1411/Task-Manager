"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginAction(email, password);
      if (result.success) {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-chart-1/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <CheckSquare className="h-7 w-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Team Task Manager
            </CardTitle>
            <CardDescription className="mt-2">
              Sign in to manage your projects and tasks
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@taskmanager.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Demo Credentials (Click to autofill)
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div 
                className="cursor-pointer hover:text-foreground transition-colors p-1 rounded hover:bg-background/50"
                onClick={() => {
                  setEmail("admin@taskmanager.com");
                  setPassword("admin123");
                }}
              >
                <span className="font-medium text-foreground">Admin:</span>{" "}
                admin@taskmanager.com / admin123
              </div>
              <div 
                className="cursor-pointer hover:text-foreground transition-colors p-1 rounded hover:bg-background/50"
                onClick={() => {
                  setEmail("ashutosh@taskmanager.com");
                  setPassword("member123");
                }}
              >
                <span className="font-medium text-foreground">Member:</span>{" "}
                ashutosh@taskmanager.com / member123
              </div>
              <div 
                className="cursor-pointer hover:text-foreground transition-colors p-1 rounded hover:bg-background/50"
                onClick={() => {
                  setEmail("rahul@taskmanager.com");
                  setPassword("member123");
                }}
              >
                <span className="font-medium text-foreground">Member:</span>{" "}
                rahul@taskmanager.com / member123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
