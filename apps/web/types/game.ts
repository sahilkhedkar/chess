export type Player = { id: string; name: string; color: "white" | "black" };

export type GameRoom = {
  id: string;
  fen: string;
  players: Player[];
  status: "waiting" | "active" | "ended";
  clocks: { white: number; black: number };
  turnStarted: number;
  currentTurn: "white" | "black";
  history: string[];
  winner: string | null;
  reason: string | null;
};
