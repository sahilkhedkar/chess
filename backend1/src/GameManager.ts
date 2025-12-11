import type WebSocket from "ws";
import { INIT_GAME } from "./message.js";

export class GameManager {
   private games: Game[];
   private pendingUser: WebSocket | null;
   private users: WebSocket[];
   constructor() {

   }

   addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler();
   }

   removeUser(socket: WebSocket) {
    this.users = this.users.filter(user => user !== socket);
    // remove the user if he disconnects
   }

   private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if(message.type === INIT_GAME) {
                if(this.pendingUser) {
                    // start the game
                } else {
                    this.pendingUser = socket;
                }
                }
            }
        )

            
   }

}