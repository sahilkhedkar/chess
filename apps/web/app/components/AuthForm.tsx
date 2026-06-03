"use client";
import { useState } from "react";
import Image from "next/image";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AuthFormProps {
  onAuth: (
    mode: "login" | "signup",
    username: string,
    password: string,
  ) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function AuthForm({ onAuth, loading, error }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAuth(mode, username, password);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="relative grid w-full max-w-4xl items-center gap-8 lg:grid-cols-[1fr_0.86fr]">
        <section className="hidden justify-center lg:flex">
          <Image
            src="/chessboard.png"
            alt="Chess board"
            width={562}
            height={564}
            priority
            className="h-auto w-full max-w-[420px] rounded-lg shadow-2xl shadow-black/40"
          />
        </section>

        <div className="relative w-full max-w-sm justify-self-center">
          <div className="animate-float mb-5 flex justify-center">
            <span className="chess-mark text-6xl leading-none">♛</span>
          </div>

          <Card className="premium-panel glow-amber">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-2xl tracking-tight text-foreground">
                {mode === "login" ? "Welcome back" : "Create account"}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Enter the room and continue your match."
                  : "Set up your player profile in seconds."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="relative block">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 bg-background/55 pl-9"
                      required
                      minLength={2}
                    />
                  </label>
                  <label className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-background/55 pl-9"
                      required
                      minLength={6}
                    />
                  </label>
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full gap-2 text-sm font-semibold shadow-lg shadow-primary/10"
                  size="lg"
                >
                  {loading ? (
                    <span className="animate-pulse-amber">Connecting...</span>
                  ) : (
                    <>
                      <LogIn className="size-4" />
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </>
                  )}
                </Button>

                <div className="pt-1 text-center text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
