import { useEffect, useRef, useState } from "react";
import type { GameRoom } from "@/types/game";

type ServerMessage = { type: string; payload: GameRoom | { playerId: string } | { message: string } };

export function useRoom() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const playerIdRef = useRef("");

  useEffect(() => {
    let active = true;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const serverUrl = process.env.NEXT_PUBLIC_WS_URL ?? `${protocol}//${window.location.hostname}:3001/ws`;
    const connection = new WebSocket(serverUrl);

    connection.onopen = () => { if (active) setConnected(true); };
    connection.onclose = () => { if (active) setConnected(false); };
    connection.onerror = () => { if (active) setError("Unable to reach the game server. Make sure it is running."); };
    connection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        if (message.type === "hello") {
          const id = (message.payload as { playerId: string }).playerId;
          playerIdRef.current = id;
          setPlayerId(id);
        } else if (message.type === "error") {
          setError((message.payload as { message: string }).message);
        } else if (["created", "started", "state", "ended"].includes(message.type)) {
          setRoom(message.payload as GameRoom);
          setError("");
        }
      } catch {
        setError("Could not read the server response.");
      }
    };

    setSocket(connection);
    return () => { active = false; connection.close(); };
  }, []);

  function send(type: string, payload: Record<string, unknown> = {}) {
    if (socket?.readyState === WebSocket.OPEN) {
      setError("");
      socket.send(JSON.stringify({ type, payload }));
    }
  }

  async function copyRoomCode() {
    if (!room) return;
    await navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function reset() {
    setRoom(null);
    setError("");
  }

  return {
    connected,
    room,
    playerId: playerId || playerIdRef.current,
    error,
    copied,
    createRoom: (name: string) => send("create", { name: name.trim() }),
    joinRoom: (name: string, roomId: string) => send("join", { name: name.trim(), roomId: roomId.trim() }),
    move: (roomId: string, from: string, to: string) => send("move", { roomId, from, to, promotion: "q" }),
    resign: (roomId: string) => send("resign", { roomId }),
    copyRoomCode,
    reset,
  };
}
