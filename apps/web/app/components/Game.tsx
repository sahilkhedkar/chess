"use client";
import { useMemo, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ChessiroCanvas, type Dests, type Square } from "chessiro-canvas";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Check,
  Clock,
  Crown,
  Flag,
  History,
  RotateCcw,
  Shield,
  Swords,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameProps {
  gameId: string;
  fen: string;
  playerColor: "white" | "black";
  currentTurn: "white" | "black";
  moveHistory: string[];
  lastMove: { from: string; to: string } | null;
  takebackRequest: boolean;
  gameOver: { winner: string | null; reason: string } | null;
  onMove: (from: string, to: string, promotion?: string) => void;
  onResign: () => void;
  onRequestTakeback: () => void;
  onRespondTakeback: (accepted: boolean) => void;
  onBackToLobby: () => void;
}

const BOARD_THEME = {
  id: "classic-wood",
  name: "Classic Wood",
  darkSquare: "#B58863",
  lightSquare: "#F0D9B5",
  lastMoveHighlight: "oklch(0.79 0.13 77 / 34%)",
  selectedPiece: "oklch(0.79 0.13 77 / 38%)",
};

export function Game({
  gameId,
  fen,
  playerColor,
  currentTurn,
  moveHistory,
  lastMove,
  takebackRequest,
  gameOver,
  onMove,
  onResign,
  onRequestTakeback,
  onRespondTakeback,
  onBackToLobby,
}: GameProps) {
  const isMyTurn = currentTurn === playerColor && !gameOver;
  const firedConfetti = useRef(false);
  const movesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    movesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moveHistory.length]);

  useEffect(() => {
    if (gameOver?.reason === "checkmate" && !firedConfetti.current) {
      firedConfetti.current = true;
      const end = Date.now() + 2500;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
    if (!gameOver) firedConfetti.current = false;
  }, [gameOver]);

  const chess = useMemo(() => new Chess(fen), [fen]);

  // Build legal move destinations map for chessiro-canvas
  const dests = useMemo<Dests>(() => {
    if (!isMyTurn) return new Map();
    const map = new Map<Square, Square[]>();
    const moves = chess.moves({ verbose: true });
    for (const move of moves) {
      const from = move.from as Square;
      const to = move.to as Square;
      const current = map.get(from);
      if (current) current.push(to);
      else map.set(from, [to]);
    }
    return map;
  }, [chess, isMyTurn]);

  const turnChar = chess.turn();
  const movableColor = isMyTurn ? turnChar : undefined;

  const chessiroLastMove = useMemo(
    () => (lastMove ? { from: lastMove.from as Square, to: lastMove.to as Square } : undefined),
    [lastMove],
  );

  const moveCount = chess.moveNumber();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 lg:flex-row lg:gap-6 lg:p-8">
      <div className="mb-3 flex w-full max-w-[min(92vw,580px)] items-center justify-between rounded-lg border border-primary/15 bg-card/70 px-4 py-2.5 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-primary" />
          <span className="text-sm font-medium capitalize text-foreground">
            {playerColor}
          </span>
        </div>
        <Badge
          variant={isMyTurn ? "default" : "secondary"}
          className={`gap-1 ${isMyTurn ? "" : "text-muted-foreground"}`}
        >
          <Clock className="size-3" />
          {isMyTurn ? "Your turn" : "Waiting..."}
        </Badge>
      </div>

      <div className="board-frame w-full max-w-[min(92vw,580px)] overflow-hidden rounded-lg p-2">
        <div className="overflow-hidden rounded-lg">
          <ChessiroCanvas
            position={fen}
            orientation={playerColor === "white" ? "white" : "black"}
            interactive={!gameOver}
            turnColor={turnChar}
            movableColor={movableColor}
            dests={dests}
            lastMove={chessiroLastMove}
            theme={BOARD_THEME}
            promotionVisuals={{
              backdropColor: "rgba(0, 0, 0, 0.74)",
              panelColor: "oklch(0.16 0.014 110 / 98%)",
              panelBorderColor: "oklch(0.79 0.13 77 / 28%)",
              panelShadow: "0 18px 55px rgba(0, 0, 0, 0.55)",
              panelRadius: "8px",
              titleColor: "oklch(0.94 0.014 82)",
              optionBackground: "oklch(0.22 0.018 112)",
              optionBorderColor: "oklch(0.79 0.13 77 / 18%)",
              optionRadius: "8px",
            }}
            squareVisuals={{
              legalDot: "oklch(0.79 0.13 77 / 48%)",
              legalDotOutline: "oklch(0.94 0.014 82 / 65%)",
              legalCaptureRing: "oklch(0.79 0.13 77 / 58%)",
              selectedOutline: "oklch(0.79 0.13 77 / 86%)",
            }}
            onMove={(from, to, promotion) => {
              const localChess = new Chess(fen);
              const result = localChess.move({
                from,
                to,
                promotion: promotion ?? undefined,
              });
              if (!result) return false;
              onMove(from, to, result.promotion || undefined);
              return true;
            }}
          />
        </div>
      </div>

      <div className="mt-3 w-full max-w-[min(92vw,580px)] lg:mt-0 lg:w-80">
        <Card className="premium-panel">
          <CardHeader className="hidden lg:block">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="grid size-9 place-items-center rounded-lg border border-primary/20 bg-primary/10">
                  <Crown className="size-4 text-primary" />
                </div>
                <span className="capitalize">{playerColor}</span>
              </div>
              <Badge
                variant={isMyTurn ? "default" : "secondary"}
                className={`gap-1 ${isMyTurn ? "" : "text-muted-foreground"}`}
              >
                <Clock className="size-3" />
                {isMyTurn ? "Your turn" : "Waiting..."}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/35 px-3 py-2.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isMyTurn
                    ? "bg-amber shadow-[0_0_8px_oklch(0.79_0.13_77)]"
                    : "bg-muted-foreground/40"
                }`}
              />
              <Swords className="size-4 text-primary/80" />
              <span className="text-sm text-muted-foreground">
                {currentTurn === "white" ? "White" : "Black"} to move
              </span>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/30 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Room</span>
                <span className="max-w-44 truncate font-mono text-xs text-foreground">
                  {gameId}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/35">
              <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <History className="size-3.5" />
                  Moves
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {moveCount}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto p-2 lg:max-h-64">
                {moveHistory.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground/60">
                    No moves yet
                  </p>
                ) : (
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-0.5">
                    {Array.from(
                      { length: Math.ceil(moveHistory.length / 2) },
                      (_, i) => {
                        const moveNum = i + 1;
                        const white = moveHistory[i * 2];
                        const black = moveHistory[i * 2 + 1];
                        const isLatest = i * 2 + 1 >= moveHistory.length - 1;
                        return (
                          <div key={moveNum} className="contents">
                            <span className="pr-1 text-right font-mono text-xs text-muted-foreground/50">
                              {moveNum}.
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 font-mono text-xs ${isLatest && !black ? "bg-amber/10 text-foreground" : "text-muted-foreground"}`}
                            >
                              {white}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 font-mono text-xs ${isLatest && black ? "bg-amber/10 text-foreground" : "text-muted-foreground"}`}
                            >
                              {black ?? ""}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
                <div ref={movesEndRef} />
              </div>
            </div>

            {/* Takeback request banner */}
            {takebackRequest && !gameOver && (
              <div className="rounded-lg border border-amber/30 bg-amber-muted p-3">
                <p className="text-sm font-medium text-foreground text-center mb-2">
                  Opponent requests a takeback
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="h-9 flex-1 gap-1.5"
                    onClick={() => onRespondTakeback(true)}
                  >
                    <Check className="size-4" />
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 flex-1 gap-1.5"
                    onClick={() => onRespondTakeback(false)}
                  >
                    <X className="size-4" />
                    Decline
                  </Button>
                </div>
              </div>
            )}

            {gameOver ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber/20 bg-amber-muted p-4 text-center">
                  <Shield className="mx-auto mb-2 size-5 text-primary" />
                  <p className="text-lg font-semibold text-foreground">
                    Game Over
                  </p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {gameOver.reason}
                  </p>
                </div>
                <Button
                  onClick={onBackToLobby}
                  className="h-11 w-full gap-2 font-semibold"
                  size="lg"
                >
                  <ArrowLeft className="size-4" />
                  Back to Lobby
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onRequestTakeback}
                  className="h-10 flex-1 gap-1.5"
                  size="lg"
                  disabled={moveHistory.length === 0}
                >
                  <RotateCcw className="size-4" />
                  Undo
                </Button>
                <Button
                  variant="destructive"
                  onClick={onResign}
                  className="h-10 flex-1 gap-1.5"
                  size="lg"
                >
                  <Flag className="size-4" />
                  Resign
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
