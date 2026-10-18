import { Check, Copy, Crown } from "lucide-react";
import type { GameRoom } from "@/types/game";

type WaitingRoomProps = { room: GameRoom; copied: boolean; onCopy: () => void; onBack: () => void };

export function WaitingRoom({ room, copied, onCopy, onBack }: WaitingRoomProps) {
  return <section className="waiting">
    <div className="wait-icon"><Crown size={28}/></div><h1>Waiting for opponent</h1><p>Share this room code with a friend to start the game.</p>
    <button className="room-code" onClick={onCopy}><span>{room.id}</span>{copied ? <Check size={19}/> : <Copy size={18}/>}</button>
    <div className="copy-hint">{copied ? "Copied to clipboard" : "Click to copy room code"}</div>
    <div className="waiting-player"><span className="avatar">♔</span><div><b>{room.players[0]?.name}</b><small>White · waiting for opponent</small></div><span className="pulse"/></div>
    <button className="subtle-btn" onClick={onBack}>← Back to lobby</button>
  </section>;
}
