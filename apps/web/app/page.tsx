"use client";
import { useState, useCallback } from "react";
import { events } from "@repo/shared/events";
import { ArrowLeft, Copy, Crown, Hourglass, Sparkles } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useSocket } from "./hooks/useSocket";
import { AuthForm } from "./components/AuthForm";
import { Lobby } from "./components/Lobby";
import { Game } from "./components/Game";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Screen = "auth" | "lobby" | "waiting" | "game";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function Home() {
  const { token, username, error, loading, authenticate, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const [screen, setScreen] = useState<Screen>("auth");
  const [gameId, setGameId] = useState<string | null>(null);
  const [fen, setFen] = useState(START_FEN);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [takebackRequest, setTakebackRequest] = useState(false);
  const [gameOver, setGameOver] = useState<{
    winner: string | null;
    reason: string;
  } | null>(null);

  const handleWsMessage = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      switch (type) {
        case events.createRoom: {
          setGameId(payload.gameId as string);
          setPlayerColor("white");
          setFen(START_FEN);
          setCurrentTurn("white");
          setGameOver(null);
          setMoveHistory([]);
          setLastMove(null);
          setScreen("waiting");
          break;
        }
        case events.joinRoom: {
          const incomingGameId = payload.gameId as string;
          const players = (payload.players as
            | { id: string; color: "white" | "black" }[]
            | undefined) ?? undefined;

          setFen((payload.fen as string) || START_FEN);
          setCurrentTurn("white");
          setGameOver(null);
          setMoveHistory([]);
          setLastMove(null);

          // Ensure we have the gameId set first so the render condition matches.
          setGameId(incomingGameId);

          // If the server provided the players list, use it to determine our color.
          if (players && username) {
            const me = players.find((p) => p.id === username);
            if (me) {
              setPlayerColor(me.color === "white" ? "white" : "black");
            }
          } else {
            // Fallback: if we don't know, assume creator is white and joiner is black.
            // If we already had a gameId before, don't flip color.
            setPlayerColor((prev) => (prev ? prev : "black"));
          }

          setScreen("game");
          break;
        }
        case events.move: {
          setFen(payload.fen as string);
          setCurrentTurn(payload.currentTurn as "white" | "black");
          setLastMove({ from: payload.from as string, to: payload.to as string });
          if (payload.san) {
            setMoveHistory((prev) => [...prev, payload.san as string]);
          }

          // Play sound
          if (payload.inCheck) {
            new Audio("/sounds/notify.mp3").play().catch(() => {});
          } else if (payload.captured) {
            new Audio("/sounds/capture.mp3").play().catch(() => {});
          } else {
            new Audio("/sounds/move-self.mp3").play().catch(() => {});
          }

          if (payload.gameOver) {
            setGameOver({
              winner: payload.winner as string | null,
              reason: payload.endReason as string,
            });
          }
          break;
        }
        case events.resign: {
          setGameOver({
            winner: payload.winner as string | null,
            reason: "resign",
          });
          break;
        }
        case events.takebackRequest: {
          setTakebackRequest(true);
          break;
        }
        case events.takebackResponse: {
          // Takeback was declined — no action needed beyond clearing any pending state
          break;
        }
        case events.takebackApplied: {
          setFen(payload.fen as string);
          setCurrentTurn(payload.currentTurn as "white" | "black");
          setMoveHistory((prev) => prev.slice(0, -1));
          setLastMove(null);
          setTakebackRequest(false);
          break;
        }
        case "error": {
          console.error("Server error:", payload.message);
          break;
        }
      }
    },
    [username],
  );

  const { connected, send } = useSocket(token, handleWsMessage);

  if (token && screen === "auth") {
    setScreen("lobby");
  }

  if (!token) {
    return <AuthForm onAuth={authenticate} loading={loading} error={error} />;
  }

  if (screen === "lobby") {
    return (
      <Lobby
        username={username!}
        connected={connected}
        onCreateRoom={() => send(events.createRoom)}
        onJoinRoom={(id) => send(events.joinRoom, { gameId: id })}
        onLogout={() => {
          logout();
          setScreen("auth");
        }}
      />
    );
  }

  if (screen === "waiting") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-sm">
          <Card className="premium-panel glow-amber">
            <CardHeader className="text-center">
              <div className="animate-pulse-amber mx-auto mb-3 grid size-16 place-items-center rounded-lg border border-primary/20 bg-primary/10">
                <Crown className="size-8 text-primary" />
              </div>
              <div className="mx-auto mb-2 flex w-fit items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Hourglass className="size-3.5" />
                Opponent pending
              </div>
              <CardTitle className="text-2xl">Waiting for opponent</CardTitle>
              <CardDescription>
                Share this room code with your opponent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="cursor-pointer rounded-lg border border-primary/15 bg-background/55 p-4 text-center font-mono text-xs break-all text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                onClick={() => {
                  if (gameId) {
                    navigator.clipboard.writeText(gameId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
              >
                <div className="mb-2 flex justify-center text-primary">
                  <Sparkles className="size-4" />
                </div>
                {gameId}
              </div>

              <Button
                variant="secondary"
                className="h-11 w-full"
                size="lg"
                onClick={() => {
                  if (gameId) {
                    navigator.clipboard.writeText(gameId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
              >
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy Room Code"}
              </Button>

              <Button
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => setScreen("lobby")}
              >
                <ArrowLeft className="size-4" />
                Back to Lobby
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (screen === "game" && gameId) {
    return (
      <Game
        gameId={gameId}
        fen={fen}
        playerColor={playerColor}
        currentTurn={currentTurn}
        moveHistory={moveHistory}
        lastMove={lastMove}
        takebackRequest={takebackRequest}
        gameOver={gameOver}
        onMove={(from, to, promotion) =>
          send(events.move, { gameId, from, to, promotion })
        }
        onResign={() => send(events.resign, { gameId })}
        onRequestTakeback={() => send(events.takebackRequest, { gameId })}
        onRespondTakeback={(accepted) => {
          send(events.takebackResponse, { gameId, accepted });
          setTakebackRequest(false);
        }}
        onBackToLobby={() => {
          setGameId(null);
          setGameOver(null);
          setScreen("lobby");
        }}
      />
    );
  }

  return null;
}
