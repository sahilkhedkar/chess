"use client";
import { useState } from "react";
import Image from "next/image";
import { DoorOpen, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LobbyProps {
  username: string;
  connected: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (gameId: string) => void;
  onLogout: () => void;
}

export function Lobby({
  username,
  connected,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}: LobbyProps) {
  const [joinId, setJoinId] = useState("");

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-3xl">
        <Card className="premium-panel glow-amber overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="chess-mark text-5xl leading-none">♛</span>
                <div>
                  <CardTitle className="text-2xl tracking-tight">Chess</CardTitle>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                <Badge variant="outline" className="max-w-full border-primary/15 bg-background/35 px-3 font-mono text-xs font-normal sm:max-w-72">
                  {username}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="gap-1.5 text-muted-foreground"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 md:grid-cols-[0.88fr_1fr]">
            <div className="flex items-center justify-center">
              <Image
                src="/chessboard.png"
                alt="Chess board"
                width={562}
                height={564}
                priority
                className="h-auto w-full max-w-[300px] rounded-lg shadow-xl shadow-black/30"
              />
            </div>

            <div className="flex flex-col justify-center space-y-5">
              <Button
                onClick={onCreateRoom}
                disabled={!connected}
                className="h-12 w-full gap-2 text-sm font-semibold shadow-lg shadow-primary/10"
                size="lg"
              >
                <Plus className="size-4" />
                New Game
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">join</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="text"
                  placeholder="Paste room code"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="h-12 flex-1 bg-background/55 font-mono text-sm"
                />
                <Button
                  onClick={() => joinId && onJoinRoom(joinId)}
                  disabled={!connected || !joinId}
                  variant="secondary"
                  className="h-12 gap-2 px-5"
                  size="lg"
                >
                  <DoorOpen className="size-4" />
                  Join
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
