import type { Square } from "chess.js";

export const FILES = "abcdefgh";
export const PIECE_GLYPHS: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

export function getBoardSquares(orientation: "white" | "black"): Square[] {
  return Array.from({ length: 64 }, (_, index) => {
    const row = Math.floor(index / 8);
    const column = index % 8;
    return (orientation === "white"
      ? `${FILES[column]}${8 - row}`
      : `${FILES[7 - column]}${row + 1}`) as Square;
  });
}

export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}
