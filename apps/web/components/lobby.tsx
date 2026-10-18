import { useRef } from "react";
import { ArrowUpRight, LoaderCircle, Swords, Timer } from "lucide-react";

type LobbyProps = {
  name: string;
  roomCode: string;
  connected: boolean;
  error: string;
  onNameChange: (value: string) => void;
  onRoomCodeChange: (value: string) => void;
  onCreate: () => void;
  onJoin: () => void;
};

export function Lobby({ name, roomCode, connected, error, onNameChange, onRoomCodeChange, onCreate, onJoin }: LobbyProps) {
  const roomCodeInput = useRef<HTMLInputElement>(null);

  return <section className="lobby">
    <div className="intro"><h1>Play chess<br/><em>with a friend.</em></h1><p>Create a room and share the code, or join a friend's game.</p></div>
    <img className="mini-board" src="/chessboard.png" alt="Classic chessboard with tan and brown squares"/>
    <div className="entry"><div className="entry-head"><strong>Play online</strong><span className="online-label"><span className={`status-dot ${connected ? "online" : ""}`}/>{connected ? "Connected" : "Connecting"}</span></div>
      <label className="field-label" htmlFor="name">Name</label><input id="name" className="text-input" placeholder="Enter your name" maxLength={24} value={name} onChange={event => onNameChange(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); roomCodeInput.current?.focus(); } }}/>
      <button type="button" className="primary-btn" onClick={onCreate} disabled={!connected}>{connected ? <><Swords size={17}/> Create a room <ArrowUpRight size={16}/></> : <><LoaderCircle size={17} className="spin"/> Connecting…</>}</button>
      <div className="divider"><span/><i>OR</i><span/></div>
      <label className="field-label" htmlFor="code">Room code</label><div className="join-row"><input ref={roomCodeInput} id="code" className="text-input code-input" placeholder="Enter room code" maxLength={6} value={roomCode} onChange={event => onRoomCodeChange(event.target.value.toUpperCase())} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onJoin(); } }}/><button type="button" className="join-btn" disabled={!connected} onClick={onJoin}>Join <ArrowUpRight size={15}/></button></div>
      {error && <p className="error">{error}</p>}
      <div className="fine-print"><Timer size={14}/> 10 minutes per player <span>·</span> Standard chess</div>
    </div>
  </section>;
}
