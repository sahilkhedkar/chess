"use client";

import { useState } from "react";
import { GameScreen } from "@/components/game-screen";
import { Lobby } from "@/components/lobby";
import { WaitingRoom } from "@/components/waiting-room";
import { useRoom } from "@/hooks/use-room";

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const game = useRoom();

  if (!game.room) {
    return (
      <main className="shell">
        <header className="topbar"><a className="brand" href="#"><span className="brand-mark">♞</span><span>chessroom<span className="brand-dot">.</span></span></a><div className="top-status"><span className={`status-dot ${game.connected ? "online" : ""}`} />{game.connected ? "Connected" : "Reconnecting"}</div></header>
        <Lobby name={name} roomCode={roomCode} connected={game.connected} error={game.error} onNameChange={setName} onRoomCodeChange={setRoomCode} onCreate={() => game.createRoom(name)} onJoin={() => game.joinRoom(name, roomCode)} />
        <footer className="footer"><span>CHESSROOM</span></footer>
      </main>
    );
  }

  if (game.room.status === "waiting") {
    return <main className="shell"><header className="topbar"><a className="brand" href="#"><span className="brand-mark">♞</span><span>chessroom<span className="brand-dot">.</span></span></a></header><WaitingRoom room={game.room} copied={game.copied} onCopy={game.copyRoomCode} onBack={game.reset} /></main>;
  }

  return <main className="shell"><header className="topbar"><a className="brand" href="#"><span className="brand-mark">♞</span><span>chessroom<span className="brand-dot">.</span></span></a><div className="top-status"><span className={`status-dot ${game.connected ? "online" : ""}`} />{game.connected ? "Connected" : "Reconnecting"}</div></header><GameScreen game={game} /></main>;
}
