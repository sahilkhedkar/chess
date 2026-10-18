import { Elysia, t } from "elysia";
import { Chess, type Color } from "chess.js";

type Player = { id: string; name: string; color: "white" | "black" };
type Room = { id: string; chess: Chess; players: Player[]; clocks: { white: number; black: number }; turnStarted: number; status: "waiting" | "active" | "ended"; winner: string | null; reason: string | null; history: string[] };
const rooms = new Map<string, Room>();
const sockets = new Map<string, Set<{ send: (data: string) => void }>>();
const send = (ws: { send: (data: string) => void }, type: string, payload: unknown) => ws.send(JSON.stringify({ type, payload }));
const colorName = (color: Color) => color === "w" ? "white" : "black";
function roomView(room: Room) { return { id: room.id, fen: room.chess.fen(), players: room.players, status: room.status, clocks: room.clocks, turnStarted: room.turnStarted, currentTurn: colorName(room.chess.turn()), history: room.history, winner: room.winner, reason: room.reason }; }
function emit(room: Room, type: string) { const msg = JSON.stringify({ type, payload: roomView(room) }); for (const p of room.players) for (const socket of sockets.get(p.id) ?? []) socket.send(msg); }
function fail(ws: { send: (data: string) => void }, message: string) { send(ws, "error", { message }); }
function stopClock(room: Room): boolean { if (room.status !== "active") return false; const now = Date.now(), color = colorName(room.chess.turn()); room.clocks[color] = Math.max(0, room.clocks[color] - (now - room.turnStarted)); room.turnStarted = now; if (room.clocks[color] === 0) { room.status = "ended"; room.winner = room.players.find(p => p.color !== color)?.id ?? null; room.reason = "timeout"; return true; } return false; }
const app = new Elysia()
  .get("/health", () => ({ ok: true, rooms: rooms.size }))
  .ws("/ws", {
    body: t.Any(),
    open(ws) { const id = crypto.randomUUID(); (ws as any).data.playerId = id; sockets.set(id, new Set([ws as any])); send(ws, "hello", { playerId: id }); },
    message(ws, raw) {
      const client = ws as any; const playerId = client.data.playerId as string;
      let msg: any; try { msg = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return fail(ws, "Invalid message"); }
      const p = msg?.payload ?? {};
      if (msg?.type === "create") {
        const name = String(p.name ?? "").trim().slice(0, 24); if (!name) return fail(ws, "Enter your name first.");
        const id = Math.random().toString(36).slice(2, 8).toUpperCase();
        const room: Room = { id, chess: new Chess(), players: [{ id: playerId, name, color: "white" }], clocks: { white: 600_000, black: 600_000 }, turnStarted: Date.now(), status: "waiting", winner: null, reason: null, history: [] };
        rooms.set(id, room); send(ws, "created", roomView(room)); return;
      }
      if (msg?.type === "join") {
        const id = String(p.roomId ?? "").trim().toUpperCase(), room = rooms.get(id), name = String(p.name ?? "").trim().slice(0, 24);
        if (!name) return fail(ws, "Enter your name first."); if (!room) return fail(ws, "Room not found. Check the code and try again."); if (room.status !== "waiting" || room.players.length !== 1) return fail(ws, "This room is already full.");
        room.players.push({ id: playerId, name, color: "black" }); room.status = "active"; room.turnStarted = Date.now(); emit(room, "started"); return;
      }
      const room = rooms.get(String(p.roomId ?? "").toUpperCase()); if (!room) return fail(ws, "Room not found.");
      const player = room.players.find(x => x.id === playerId); if (!player) return fail(ws, "You are not a player in this room.");
      if (msg.type === "move") {
        if (room.status !== "active") return fail(ws, "Game is not active yet.");
        if (stopClock(room)) { emit(room, "ended"); return; }
        if (player.color !== colorName(room.chess.turn())) return fail(ws, "It is your opponent's turn.");
        try { const move = room.chess.move({ from: p.from, to: p.to, promotion: p.promotion ?? "q" }); room.history = room.chess.history(); room.turnStarted = Date.now();
          if (room.chess.isGameOver()) { room.status = "ended"; room.winner = room.chess.isCheckmate() ? playerId : null; room.reason = room.chess.isCheckmate() ? "checkmate" : room.chess.isStalemate() ? "stalemate" : "draw"; }
          emit(room, "state");
        } catch { fail(ws, "That move is not legal."); }
        return;
      }
      if (msg.type === "resign" && room.status === "active") { room.status = "ended"; room.winner = room.players.find(x => x.id !== playerId)?.id ?? null; room.reason = "resignation"; emit(room, "ended"); }
    },
    close(ws) { const client = ws as any, playerId = client.data.playerId as string; sockets.delete(playerId); },
  })
  .listen(Number(Bun.env.PORT ?? 3001));

console.log(`Chess server listening on ${app.server?.hostname}:${app.server?.port}`);

setInterval(() => {
  for (const room of rooms.values()) {
    if (room.status !== "active") continue;
    if (stopClock(room)) emit(room, "ended");
  }
}, 250);
