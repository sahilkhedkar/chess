# Chessroom

A two player chess room built with a Turborepo, Next.js, TypeScript, Elysia, and chess.js. No accounts are required. The server owns the game state, validates every move, and runs each player's 10 minute clock.

## Project structure

```text
apps/
  web/
    app/          Next.js routes, layout, and global styles
    components/   Lobby, board, waiting room, and game panels
    hooks/        WebSocket room connection and game actions
    lib/          Chessboard helpers and clock formatting
    types/        Shared client-side game types
    public/       Static images
  server/
    src/          Elysia WebSocket server and authoritative game state
```

## Run locally

Install Bun, then run:

```sh
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in two browsers. Enter a name and create a room in the first browser, then enter the room code and a name in the second browser. The Elysia WebSocket server listens on port 3001; by default the browser connects to port 3001 on the same hostname that served the web app. Set `NEXT_PUBLIC_WS_URL` for a different WebSocket address.

For production builds, run `bun run build`. The current server stores rooms in memory, so active games end when the server restarts.
