import { WebSocketServer } from "ws";
import { events } from "@repo/shared/events";
import { websocketMessageSchema } from "@repo/shared/zod-schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/shared/constants";

const wss = new WebSocketServer({ port: 8080 });

const decodeJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("JWT verified:", decoded);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

wss.on("connection", (ws, req) => {
  console.log("New connection attempt");

  if (!req.url) {
    console.log("Missing URL");
    ws.close(1008, "Missing URL");
    return;
  }

  console.log("Request URL:", req.url);

  const token = new URL(
    `http://localhost:8080${req.url}`
  ).searchParams.get("token");

  console.log("Received token:", token);

  const user = token ? decodeJwt(token) : null;

  if (!user) {
    console.log("Unauthorized connection");
    ws.close(1008, "Unauthorized");
    return;
  }

  console.log("Authenticated user:", user);

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  ws.on("close", (code, reason) => {
    console.log(
      `Connection closed. Code: ${code}, Reason: ${reason.toString()}`
    );
  });

  ws.on("message", (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());

      const result = websocketMessageSchema.safeParse(parsed);

      if (!result.success) {
        console.error("Invalid message format:", parsed);
        return;
      }

      const data = result.data;

      console.log("Received message:", data);

      switch (data.type) {
        case events.createRoom:
          console.log(
            "Create room event received:",
            data.payload
          );
          break;

        case events.joinRoom:
          console.log(
            "Join room event received:",
            data.payload
          );
          break;

        case events.move:
          console.log(
            "Move event received:",
            data.payload
          );
          break;

        case events.resign:
          console.log(
            "Resign event received:",
            data.payload
          );
          break;

        default:
          console.warn(
            "Unknown event type:",
            data.type
          );
      }
    } catch (error) {
      console.error(
        "Invalid JSON received:",
        raw.toString()
      );
    }
  });

  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Successfully connected to WebSocket server",
    })
  );
});

console.log("WebSocket server is running on ws://localhost:8080");