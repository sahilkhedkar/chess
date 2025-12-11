import type WebSocket from "ws";

export class Game {
  private player1: WebSocket;
  private player2: WebSocket;
  private moves: string[];
  private startTime: Date;
  private board: string;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.moves = [];
    this.startTime = new Date();
    this.board = "";
  }
}
