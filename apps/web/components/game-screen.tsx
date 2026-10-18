import { useEffect, useState, type CSSProperties } from "react";
import { Flag, Link2, RotateCcw, Timer, Wifi } from "lucide-react";
import { ChessBoard } from "@/components/chess-board";
import { formatClock } from "@/lib/chess";
import type { GameRoom } from "@/types/game";

type GameController = {
  room: GameRoom | null;
  playerId: string;
  copied: boolean;
  copyRoomCode: () => Promise<void>;
  move: (roomId: string, from: string, to: string) => void;
  resign: (roomId: string) => void;
  reset: () => void;
};

export function GameScreen({ game }: { game: GameController }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(timer); }, []);
  const room = game.room;
  if (!room) return null;

  const player = room.players.find(item => item.id === game.playerId);
  const opponent = room.players.find(item => item.id !== game.playerId);
  const color = player?.color ?? "white";
  const yourTurn = room.status === "active" && room.currentTurn === color;
  const remaining = { ...room.clocks, [room.currentTurn]: Math.max(0, room.clocks[room.currentTurn] - (room.status === "active" ? now - room.turnStarted : 0)) };

  return <section className="game-layout">
    <div className="play-column">
      <PlayerBar player={opponent} color="black" clock={remaining.black} active={room.status === "active" && room.currentTurn === "black"}/>
      <ChessBoard fen={room.fen} orientation={color} canMove={yourTurn} onMove={(from, to) => game.move(room.id, from, to)}/>
      <PlayerBar player={player} color="white" clock={remaining.white} active={room.status === "active" && room.currentTurn === "white"} you/>
    </div>
    <aside className="game-sidebar">
      <div className="game-heading"><strong>Game</strong><span className="room-chip"><span className="status-dot online"/> LIVE</span></div>
      <div className="turn-banner"><span className="turn-icon">{room.currentTurn === "white" ? "♔" : "♚"}</span><div><small>{room.status === "ended" ? "GAME OVER" : yourTurn ? "YOUR MOVE" : "OPPONENT'S MOVE"}</small><b>{room.status === "ended" ? (room.winner ? `${room.players.find(item => item.id === room.winner)?.name} wins` : room.reason) : `${room.players.find(item => item.color === room.currentTurn)?.name ?? room.currentTurn} to move`}</b></div></div>
      <div className="moves-card"><div className="moves-title"><span>Move history</span><span>{room.history.length ? Math.ceil(room.history.length / 2) : "—"}</span></div><div className="moves-list"><div className="moves-columns"><span>#</span><span>White · {room.players.find(item => item.color === "white")?.name ?? "White"}</span><span>Black · {room.players.find(item => item.color === "black")?.name ?? "Black"}</span></div>{room.history.length === 0 ? <div className="empty-moves"><span>♘</span><p>The game is ready.<br/>Make the first move.</p></div> : Array.from({ length: Math.ceil(room.history.length / 2) }, (_, index) => <div className="move-row" key={index}><span>{index + 1}.</span><b>{room.history[index * 2]}</b><b>{room.history[index * 2 + 1] ?? ""}</b></div>)}</div></div>
      <div className="sidebar-actions">{room.status === "active" ? <button className="resign-btn" onClick={() => game.resign(room.id)}><Flag size={15}/> Resign</button> : <button className="resign-btn" onClick={game.reset}>Back to lobby</button>}<button className="share-btn" onClick={game.copyRoomCode}><Link2 size={15}/>{game.copied ? "Room code copied" : "Share room"}</button></div>
      <div className="game-foot"><Timer size={14}/> 10 minute game <span>·</span><span className="connection-text"><Wifi size={13}/> Connected</span></div>
    </aside>
    {room.status === "ended" && room.winner && <div className="win-overlay">{Array.from({ length: 72 }, (_, index) => { const angle = (index / 72) * Math.PI * 2; const distance = 25 + (index % 7) * 10; const dx = Math.cos(angle) * distance; const dy = Math.sin(angle) * (25 + (index % 6) * 11); return <i className="confetti" key={index} style={{ left: "50%", top: "50%", "--dx": `${dx}vw`, "--dy": `${dy}vh`, "--spin": `${360 + (index % 5) * 170}deg`, animationDelay: `${(index % 12) * 15}ms`, backgroundColor: `hsl(${(index * 47) % 360},85%,62%)` } as CSSProperties}/> })}<div className="win-card"><span className="win-crown">♛</span><span className="eyebrow">{room.reason === "checkmate" ? "CHECKMATE" : room.reason?.toUpperCase()}</span><h2>{room.players.find(item => item.id === room.winner)?.name} wins!</h2><p>That was a good game.</p><button className="primary-btn" onClick={game.reset}><RotateCcw size={16}/> Play again</button></div></div>}
  </section>;
}

function PlayerBar({ player, color, clock, active, you = false }: { player?: GameRoom["players"][number]; color: "white" | "black"; clock: number; active: boolean; you?: boolean }) {
  return <div className={`player-bar ${color === "white" ? "bottom-player" : ""}`}><span className={`player-avatar ${color === "white" ? "light-avatar" : "dark-avatar"}`}>{player?.name?.slice(0, 1).toUpperCase() ?? "?"}</span><div className="player-meta"><b>{player?.name ?? "Opponent"} {you && <small className="you-tag">YOU</small>}</b><small>{color.toUpperCase()} <span>·</span> {you ? "YOUR SIDE" : "OPPONENT"}</small></div><div className={`clock ${active ? "clock-active" : ""}`}>{formatClock(clock)}</div></div>;
}
