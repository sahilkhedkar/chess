import { useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { getBoardSquares, PIECE_GLYPHS } from "@/lib/chess";

type ChessBoardProps = { fen: string; orientation: "white" | "black"; canMove: boolean; onMove: (from: string, to: string) => void };

export function ChessBoard({ fen, orientation, canMove, onMove }: ChessBoardProps) {
  const chess = useMemo(() => new Chess(fen), [fen]);
  const squares = useMemo(() => getBoardSquares(orientation), [orientation]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  useEffect(() => { setSelected(null); setLegalMoves([]); }, [fen]);

  function choose(square: Square) {
    if (!canMove) return;
    if (selected && legalMoves.includes(square)) {
      onMove(selected, square);
      setSelected(null);
      setLegalMoves([]);
      return;
    }
    const piece = chess.get(square);
    if (piece && piece.color === (orientation === "white" ? "w" : "b")) {
      setSelected(square);
      setLegalMoves(chess.moves({ square, verbose: true }).map(move => move.to as Square));
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }

  return <div className="board-wrap"><div className="board">{squares.map((square, index) => {
    const piece = chess.get(square);
    return <button key={square} onClick={() => choose(square)} aria-label={`${square}${piece ? ` ${piece.color} ${piece.type}` : ""}`} className={`square ${(Math.floor(index / 8) + index % 8) % 2 ? "sq-dark" : "sq-light"} ${selected === square ? "selected" : ""} ${legalMoves.includes(square) ? piece ? "capture" : "legal" : ""}`}>
      <span className={`piece ${piece?.color === "b" ? "piece-black" : ""}`}>{piece ? PIECE_GLYPHS[piece.color === "w" ? piece.type.toUpperCase() : piece.type] : ""}</span>
      {index % 8 === 0 && <span className="coord rank">{square[1]}</span>}{Math.floor(index / 8) === 7 && <span className="coord file">{square[0]}</span>}
    </button>;
  })}</div></div>;
}
