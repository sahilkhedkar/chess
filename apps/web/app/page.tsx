"use client";

import { useEffect, useState } from "react";
import { GameScreen } from "@/components/game-screen";
import { Lobby } from "@/components/lobby";
import { ThemeToggle } from "@/components/theme-toggle";
import { WaitingRoom } from "@/components/waiting-room";
import { useRoom } from "@/hooks/use-room";

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [dark, setDark] = useState(false);
  const game = useRoom();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("chessroom-theme");
    const isDark = savedTheme === "dark";
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    window.localStorage.setItem("chessroom-theme", nextDark ? "dark" : "light");
  }

  if (!game.room) {
    return (
      <main className="shell">
        <Header connected={game.connected} dark={dark} onToggleTheme={toggleTheme}/>
        <Lobby name={name} roomCode={roomCode} connected={game.connected} error={game.error} onNameChange={setName} onRoomCodeChange={setRoomCode} onCreate={() => game.createRoom(name)} onJoin={() => game.joinRoom(name, roomCode)} />
        <footer className="footer"><span>CHESSROOM</span></footer>
      </main>
    );
  }

  if (game.room.status === "waiting") {
    return <main className="shell"><Header connected={game.connected} dark={dark} onToggleTheme={toggleTheme}/><WaitingRoom room={game.room} copied={game.copied} onCopy={game.copyRoomCode} onBack={game.reset} /></main>;
  }

  return <main className="shell"><Header connected={game.connected} dark={dark} onToggleTheme={toggleTheme}/><GameScreen game={game} /></main>;
}

function Header({ connected, dark, onToggleTheme }: { connected: boolean; dark: boolean; onToggleTheme: () => void }) {
  return <header className="topbar">
    <a className="brand" href="#"><span className="brand-mark">♞</span><span>chessroom<span className="brand-dot">.</span></span></a>
    <div className="header-actions"><div className="top-status"><span className={`status-dot ${connected ? "online" : ""}`} />{connected ? "Connected" : "Reconnecting"}</div><ThemeToggle dark={dark} onToggle={onToggleTheme}/></div>
  </header>;
}
